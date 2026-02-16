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
      <div className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm max-w-[50%] min-w-0">
        <p className="wrap-break-word whitespace-pre-wrap">
          lorem ipsum jasdjkzxc ikasdklzxc lzkxcjasdjpioasdsdashkldjhkljasdhjklasdjklhasjklhdjklhasdjklhaslk
          asjkdjkahsdkhjashkdjlhkjalsdhkjlaskldhjlahjksd
          asjkdhaskjldhkasjdhajklsdhalskd
          asdjkasjlkdlkajsdjklaskdjla
          sdasjkldljkasdjkasldkajsdas
          dasdlkjasdjklasdjlk
        </p>
      </div>
    </div>
  )
}

