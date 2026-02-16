import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { MessageDirection } from "@/types/message.type"

interface MessageBubbleProps {
  direction: MessageDirection
}

export const MessageBubble = ({direction}: MessageBubbleProps) => {
  return (
    <div className={`flex gap-2 ${direction === 'OUTBOUND' ? 'flex-row-reverse' : ''}`}>
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className={`px-4 py-2 rounded-lg shadow-sm text-sm max-w-[50%] min-w-0 ${direction === 'OUTBOUND' ? 'bg-[#d4f1ff]' : 'bg-white '}`}>
        <p className="wrap-break-word whitespace-pre-wrap">
          lorem ipsum jasdjkzxc ikasdklzxc lzkxcjasdjpioasdsdashkldjhkljasdhjklasdjklhasjklhdjklhasdjklhaslk
          asjkdjkahsdkhjashkdjlhkjalsdhkjlaskldhjlahjksd
        </p>
        <MessageTimestamp/>
      </div>
    </div>
  )
}

function MessageText() {
  return (
    <p className="wrap-break-word whitespace-pre-wrap">
      lorem ipsum jasdjkzxc ikasdklzxc lzkxcjasdjpioasdsdashkldjhkljasdhjklasdjklhasjklhdjklhasdjklhaslk
      asjkdjkahsdkhjashkdjlhkjalsdhkjlaskldhjlahjksd
    </p>

  )

}

function MessageAudio() {

}

function MessageImage() {

}

function MessageTimestamp() {
  return (
    <span className="flex justify-end text-gray-500 text-xs wrap-break-word whitespace-pre-wrap">
      13:13 PM
    </span>
  )
}
