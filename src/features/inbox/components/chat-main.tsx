import { useEffect, useRef } from "react"
import { useMessages } from "@/features/inbox/hooks/useMessages"
import { useLiveMessages } from "@/features/inbox/hooks/useLiveMessages"
import { useToggleBot } from "@/features/inbox/hooks/useToggleBot"
import { useLiveConversations } from "@/features/inbox/hooks/useLiveConversations"
import { useSendMessage } from "@/features/inbox/hooks/useSendMessage"
import { useAuth } from "@/features/auth/context"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
import { Spinner } from "@/components/ui/spinner"
import type { Socket } from "socket.io-client"
import { MessageSquareIcon, PhoneIcon, UserIcon } from "lucide-react"
import { WhatsappIcon } from "@/components/icons/WhatsappIcon"

export interface ChatMainProps {
  conversationId: string;
  socket: Socket | null;
  showContactDetails: boolean;
}

export const ChatMain = ({ conversationId, socket, showContactDetails = false }: ChatMainProps) => {
  const { session } = useAuth()
  const tenantId = ((session?.user as any)?.tenantId as string) ?? ""
  const senderId = session?.user?.id ?? ""

  // Trigger server fetch + sync into IndexedDB
  const { isPending, isError } = useMessages(conversationId)

  // Reactive read from IndexedDB — updates automatically as sync writes data
  const messages = useLiveMessages(conversationId)

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

  const handleSend = (body: string) => {
    send({ conversationId, messageType: "TEXT", body })
  }

  // Scroll to bottom sentinel whenever messages change or conversation switches
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" })
  }, [conversationId, messages.length])

  return (
    <div className="flex flex-1 min-h-0 text-black">
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
                <div key={message.id} className="flex flex-col gap-4">
                  {showSeparator && <DateSeparator date={new Date(message.sentAt)} />}
                  <MessageBubble message={message} />
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>
        <div className="px-4 pb-4 shrink-0">
          <MessageInput
            botEnabled={botEnabled}
            isTogglingBot={isTogglingBot}
            onToggleBot={() => toggleBot()}
            onSend={handleSend}
            isSending={isSending}
          />
        </div>
      </div>
      {showContactDetails &&
        <div className="w-[20%] shrink-0 flex flex-col p-4 bg-white">
          <div className="">
            <span className="font-semibold">Detalles del contacto</span>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <ContactDetails/>
          </div>
        </div>
      }
    </div>
  )
}

function MessagesLoading() {
  return (
    <div className="flex flex-col gap-2 h-full my-auto items-center justify-center text-gray-500">
      <Spinner className="size-12" />
      <span>Cargando mensajes</span>
    </div>
  )
}

function MessagesError() {
  return (
    <div className="flex h-full items-center justify-center text-gray-500 text-sm">
      No se pudieron cargar los mensajes.
    </div>
  )
}

function MessagesEmpty() {
  return (
    <div className="flex h-full items-center justify-center text-gray-400 text-sm">
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
      <span className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium shrink-0 capitalize">{label}</span>
      <span className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

function ContactDetails() {
  const items = [
    {label: 'Nombre', value: 'John Doe', icon: <UserIcon className="w-5 h-5"/>},
    {label: 'Nombre', value: 'John Doe', icon: <UserIcon className="w-5 h-5"/>},
    {label: 'Nombre', value: 'John Doe', icon: <UserIcon className="w-5 h-5"/>},
  ]

  return items.map((item) => {
    return (
      <div className="flex items-center gap-2">
        {item.icon}
        <div className="flex flex-col text-sm">
          <span className="font-semibold">{item.label}</span>
          <span>{item.value}</span>
        </div>
      </div>
    )
  })
}
