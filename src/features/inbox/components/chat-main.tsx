import { useEffect, useMemo, useRef, useState } from "react"
import { useMessages } from "@/features/inbox/hooks/useMessages"
import { useLiveMessages } from "@/features/inbox/hooks/useLiveMessages"
import { useToggleBot } from "@/features/inbox/hooks/useToggleBot"
import { useLiveConversations } from "@/features/inbox/hooks/useLiveConversations"
import { useSendMessage } from "@/features/inbox/hooks/useSendMessage"
import { useUploadFile } from "@/features/inbox/hooks/useUploadFile"
import { getFileUrl } from "@/lib/api/files"
import { useLiveCustomer } from "@/features/inbox/hooks/useLiveCustomer"
import { useAuth } from "@/features/auth/context"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
import { Spinner } from "@/components/ui/spinner"
import type { Socket } from "socket.io-client"
import { AtSignIcon, MailIcon, PhoneIcon, UserIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { CachedCustomer } from "@/lib/db"
import type { ConversationChannel } from "@/types/conversation.type"
import parsePhoneNumber from "libphonenumber-js"

export interface ChatMainProps {
  conversationId: string;
  socket: Socket | null;
  showContactDetails: boolean;
  messageSearchQuery?: string;
  currentMatchIndex?: number;
  onMatchCountChange?: (count: number) => void;
}

export const ChatMain = ({ conversationId, socket, showContactDetails = false, messageSearchQuery = "", currentMatchIndex = 0, onMatchCountChange }: ChatMainProps) => {
  const { session } = useAuth()
  const tenantId = ((session?.user as any)?.tenantId as string) ?? ""
  const senderId = session?.user?.id ?? ""

  // Trigger server fetch + sync into IndexedDB
  const { isPending, isError } = useMessages(conversationId)

  // Reactive read from IndexedDB — updates automatically as sync writes data
  const messages = useLiveMessages(conversationId)

  const matchingIds = useMemo(() => {
    if (!messageSearchQuery) return []
    const q = messageSearchQuery.toLowerCase()
    return messages.filter((m) => m.body?.toLowerCase().includes(q)).map((m) => m.id)
  }, [messages, messageSearchQuery])

  useEffect(() => {
    onMatchCountChange?.(matchingIds.length)
  }, [matchingIds.length])

  const messageRefs = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    if (!messageSearchQuery || matchingIds.length === 0) return
    const el = messageRefs.current.get(matchingIds[currentMatchIndex])
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [currentMatchIndex, matchingIds, messageSearchQuery])

  // Read botEnabled and channel from the live conversation in IndexedDB
  const { conversations } = useLiveConversations()
  const conversation = conversations.find((c) => c.id === conversationId)
  const botEnabled = conversation?.botEnabled ?? false
  const channel = conversation?.channel ?? "WHATSAPP"

  // Toggle bot mutation — updates TanStack Query cache and IndexedDB on success
  const { mutate: toggleBot, isPending: isTogglingBot } = useToggleBot(conversationId)

  // Send message over socket with optimistic IndexedDB write
  const { send, isSending } = useSendMessage({
    socket,
    tenantId,
    channel,
    senderId,
  })

  const { mutate: uploadFile, isPending: isUploading } = useUploadFile()
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)
  const pendingBlobRef = useRef<string | null>(null)
  const fetchedInboundIds = useRef<Set<string>>(new Set())
  const [blobUrlById, setBlobUrlById] = useState<Map<string, string>>(new Map())

  // Reset inbound tracking and revoke stored blob URLs when conversation changes
  useEffect(() => {
    fetchedInboundIds.current.clear()
    return () => {
      blobUrlById.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [conversationId])

  const handleSend = (body: string) => {
    send({ conversationId, messageType: "TEXT", body })
  }

  const handleFileSelected = (file: File) => {
    pendingBlobRef.current = URL.createObjectURL(file)
    setUploadingFile(file)
    uploadFile({ file, conversationId }, {
      onSettled: () => setUploadingFile(null),
      onError: () => {
        if (pendingBlobRef.current) {
          URL.revokeObjectURL(pendingBlobRef.current)
          pendingBlobRef.current = null
        }
      },
    })
  }

  // When a new IMAGE message arrives via socket, populate blobUrlById so ImageViewer
  // can display it instantly without waiting for its own server fetch.
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.messageType !== "IMAGE") return

    // OUTBOUND: claim the blob URL captured at upload time
    if (lastMsg.direction === "OUTBOUND" && pendingBlobRef.current) {
      const blobUrl = pendingBlobRef.current
      pendingBlobRef.current = null
      setBlobUrlById((prev) => new Map(prev).set(lastMsg.id, blobUrl))
      return
    }

    // INBOUND: fire-and-forget fetch; ImageViewer's retry is the fallback if this fails
    const whatsappMediaId = lastMsg.media?.whatsappMediaId
    if (lastMsg.direction === "INBOUND" && whatsappMediaId && !fetchedInboundIds.current.has(lastMsg.id)) {
      fetchedInboundIds.current.add(lastMsg.id)
      const url = getFileUrl(lastMsg.channel, "IMAGE", whatsappMediaId)
      fetch(url, { credentials: "include" })
        .then((res) => { if (!res.ok) throw new Error(); return res.blob() })
        .then((blob) => setBlobUrlById((prev) => new Map(prev).set(lastMsg.id, URL.createObjectURL(blob))))
        .catch(() => {})
    }
  }, [messages])

  // Scroll to bottom sentinel whenever messages change or conversation switches
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (messageSearchQuery) return
    bottomRef.current?.scrollIntoView({ behavior: "instant" })
  }, [conversationId, messages.length, messageSearchQuery])

  return (
    <div className="flex flex-1 min-h-0 text-foreground">
      <div className="flex flex-col h-full bg-background flex-1 min-w-0">
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4">
          {isPending && messages.length === 0 ? (
            <MessagesLoading />
          ) : isError ? (
              <MessagesError />
            ) : messages.length === 0 ? (
                <MessagesEmpty />
              ) : (
                  messages.map((message, index) => {
                    const prevMessage = messages[index - 1]
                    const currentDay = new Date(message.sentAt).toDateString()
                    const prevDay = prevMessage ? new Date(prevMessage.sentAt).toDateString() : null
                    const showSeparator = currentDay !== prevDay

                    return (
                      <div
                        key={message.id}
                        id={message.execId ?? ""}
                        className="flex flex-col gap-4"
                        ref={(el) => {
                          if (el) messageRefs.current.set(message.id, el)
                          else messageRefs.current.delete(message.id)
                        }}
                      >
                        {showSeparator && <DateSeparator date={new Date(message.sentAt)} />}
                        <MessageBubble
                          message={message}
                          customerId={conversation?.customerId}
                          searchQuery={messageSearchQuery || undefined}
                          isCurrentMatch={matchingIds[currentMatchIndex] === message.id}
                          localBlobUrl={blobUrlById.get(message.id)}
                        />
                      </div>
                    )
                  })
                )}
          {uploadingFile && <UploadingImageBubble file={uploadingFile} />}
          <div ref={bottomRef} />
        </div>
        <div className="px-4 pb-4 shrink-0">
          <MessageInput
            botEnabled={botEnabled}
            isTogglingBot={isTogglingBot}
            onToggleBot={() => toggleBot()}
            onSend={handleSend}
            onFileSelected={handleFileSelected}
            isUploading={isUploading}
            isSending={isSending}
          />
        </div>
      </div>
      {showContactDetails &&
        <div className="w-[20%] shrink-0 flex flex-col p-4 bg-white dark:bg-card border-l border-border">
          <span className="font-semibold mb-4">Detalles del contacto</span>
          <ContactDetails customerId={conversation?.customerId} channel={channel} />
        </div>
      }
    </div>
  )
}

function MessagesLoading() {
  return (
    <div className="flex flex-col gap-2 h-full my-auto items-center justify-center text-gray-500 dark:text-gray-400">
      <Spinner className="size-12" />
      <span>Cargando mensajes</span>
    </div>
  )
}

function MessagesError() {
  return (
    <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
      No se pudieron cargar los mensajes.
    </div>
  )
}

function MessagesEmpty() {
  return (
    <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
      No hay mensajes en esta conversación.
    </div>
  )
}

function DateSeparator({ date }: { date: Date }) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  let label: string
  if (date >= startOfToday) {
    label = "Hoy"
  } else if (date >= startOfYesterday) {
    label = "Ayer"
  } else if (date >= startOfYear) {
    label = new Intl.DateTimeFormat("es-VE", { weekday: "long", day: "numeric", month: "long" }).format(date)
  } else {
    label = new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "long", year: "numeric" }).format(date)
  }

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium shrink-0 capitalize">{label}</span>
      <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  )
}

function UploadingImageBubble({ file }: { file: File }) {
  const src = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(src), [src])

  return (
    <div className="flex gap-2 flex-row-reverse">
      <Avatar className="flex shadow-sm items-center justify-center w-10 h-10 shrink-0">
        <AvatarFallback><UserIcon className="w-5 h-5" /></AvatarFallback>
      </Avatar>
      <div className="px-4 py-2 rounded-lg shadow-sm text-sm max-w-[60%] min-w-0 bg-[#d4f1ff] dark:bg-blue-900/40">
        <div className="relative">
          <img src={src} alt="" className="rounded max-w-full object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="size-8" />
          </div>
        </div>
        <span className="flex justify-end text-gray-500 dark:text-gray-400 text-xs mt-1">
          {new Intl.DateTimeFormat("es-VE", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date())}
        </span>
      </div>
    </div>
  )
}

function ContactDetails({ customerId, channel }: { customerId?: string; channel: ConversationChannel }) {
  const customer = useLiveCustomer(customerId)

  const phone = customer?.whatsappId
    ? parsePhoneNumber("+" + customer.whatsappId)?.formatInternational() ?? customer.whatsappId
    : null

  const items = [
    {
      label: "Nombre",
      value: customer?.name ?? "—",
      icon: <UserIcon className="w-4 h-4 shrink-0 text-muted-foreground" />,
    },
    ...(channel === "WHATSAPP" ? [{
      label: "Teléfono",
      value: phone ?? "—",
      icon: <PhoneIcon className="w-4 h-4 shrink-0 text-muted-foreground" />,
    }] : []),
    ...(channel === "INSTAGRAM" ? [{
      label: "Instagram",
      value: customer?.instagramUsername ? `@${customer.instagramUsername}` : "—",
      icon: <AtSignIcon className="w-4 h-4 shrink-0 text-muted-foreground" />,
    }] : []),
    {
      label: "Email",
      value: customer?.email ?? "Sin email",
      icon: <MailIcon className="w-4 h-4 shrink-0 text-muted-foreground" />,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-2">
          <div className="mt-0.5">{item.icon}</div>
          <div className="flex flex-col text-sm min-w-0">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            {item.label === 'Instagram' 
              ? <a href={`https://www.instagram.com/${item.value}`}>{item.value}</a> 
              : <span className="truncate">{item.value}</span>
            }
          </div>
        </div>
      ))}
    </div>
  )
}
