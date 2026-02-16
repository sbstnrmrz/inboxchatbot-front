import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"

export const ChatMain = () => {
  return (
    <div className="p-4 bg-primary-white">
      <MessageBubble direction="OUTBOUND"/>
      <MessageInput/>
    </div>
  )
}

