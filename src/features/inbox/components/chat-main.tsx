import { useMessages } from "@/features/inbox/hooks/useMessages"
import { useLiveMessages } from "@/features/inbox/hooks/useLiveMessages"
import { useToggleBot } from "@/features/inbox/hooks/useToggleBot"
import { useLiveConversations } from "@/features/inbox/hooks/useLiveConversations"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
import { Spinner } from "@/components/ui/spinner"

export interface ChatMainProps {
  conversationId: string;
}

export const ChatMain = ({ conversationId }: ChatMainProps) => {
  // Trigger server fetch + sync into IndexedDB
  const { isPending, isError } = useMessages(conversationId)

  // Reactive read from IndexedDB — updates automatically as sync writes data
  const messages = useLiveMessages(conversationId)

  // Read botEnabled from the live conversation in IndexedDB
  const conversations = useLiveConversations()
  const conversation = conversations.find((c) => c.id === conversationId)
  const botEnabled = conversation?.botEnabled ?? false

  // Toggle bot mutation — updates TanStack Query cache and IndexedDB on success
  const { mutate: toggleBot, isPending: isTogglingBot } = useToggleBot(conversationId)

  return (
    <div className="flex-1 min-h-0 text-black">
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4">
          {isPending && messages.length === 0 ? (
            <MessagesLoading />
          ) : isError ? (
            <MessagesError />
          ) : messages.length === 0 ? (
            <MessagesEmpty />
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>
        <div className="px-4 pb-4 shrink-0">
          <MessageInput
            botEnabled={botEnabled}
            isTogglingBot={isTogglingBot}
            onToggleBot={() => toggleBot()}
          />
        </div>
      </div>
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

function DateSeparator() {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="flex w-full h-[1px] bg-black"></span>
      <span className="px-4 shrink-0">{new Date().toLocaleString()}</span>
      <span className="flex w-full h-[1px] bg-black"></span>
    </div>
  )
}
