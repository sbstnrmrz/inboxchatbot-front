import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CachedMessage } from "@/lib/db/schema"

interface MessageBubbleProps {
  message: CachedMessage
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { direction, body, messageType, sentAt } = message
  const isOutbound = direction === "OUTBOUND"

  return (
    <div className={`flex gap-2 ${isOutbound ? "flex-row-reverse" : ""}`}>
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div
        className={`px-4 py-2 rounded-lg shadow-sm text-sm max-w-[50%] min-w-0 ${
          isOutbound ? "bg-[#d4f1ff]" : "bg-white"
        }`}
      >
        <MessageContent body={body} messageType={messageType} />
        <MessageTimestamp sentAt={sentAt} />
      </div>
    </div>
  )
}

function MessageContent({
  body,
  messageType,
}: {
  body?: string
  messageType: CachedMessage["messageType"]
}) {
  if (body) {
    return <p className="wrap-break-word whitespace-pre-wrap">{body}</p>
  }

  const mediaLabels: Partial<Record<CachedMessage["messageType"], string>> = {
    IMAGE: "📷 Imagen",
    AUDIO: "🎵 Audio",
    VIDEO: "🎬 Video",
    DOCUMENT: "📄 Documento",
    STICKER: "🏷️ Sticker",
    LOCATION: "📍 Ubicación",
    CONTACTS: "👤 Contacto",
  }

  const label = mediaLabels[messageType] ?? "Mensaje"
  return <p className="text-gray-500 italic">{label}</p>
}

function MessageTimestamp({ sentAt }: { sentAt: number }) {
  const formatted = new Intl.DateTimeFormat("es-VE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(sentAt))

  return (
    <span className="flex justify-end text-gray-500 text-xs mt-1">
      {formatted}
    </span>
  )
}
