import { FacebookIcon } from "@/components/icons/FacebookIcon"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CachedMessage } from "@/lib/db/schema"
import type { MessageChannel, MessageMedia, MessageReferral } from "@/types/message.type"
import { BotIcon } from "lucide-react"
import { AudioPlayer } from "./audio-player"
import { ImageViewer } from "./image-viewer"

interface MessageBubbleProps {
  message: CachedMessage
}

enum ReferralType {
  Facebook = 'facebook',
  Instagram = 'instagram',
  Unknown = 'unknown',
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { direction, body, messageType, sentAt, sender } = message
  const isOutbound = direction === "OUTBOUND"
  const isBotMessage = sender.type === 'BOT';

  return (
    <div className={`flex gap-2 ${isOutbound ? "flex-row-reverse" : ""}`}>
      <Avatar className={`flex shadow-sm items-center justify-center w-10 h-10 shrink-0 ${isBotMessage ? 'bg-[#d4f1ff]' : ''}`}>
        {isBotMessage
          ? 
          <BotIcon className="w-6 h-6"/>
          : 
          <>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </>
        }
      </Avatar>
      <div
        className={`px-4 py-2 rounded-lg shadow-sm text-sm max-w-[50%] min-w-0 ${
          isOutbound ? "bg-[#d4f1ff]" : "bg-white"
        }`}
      >
        <ReferralLabel referral={message.referral}/>
        <MessageContent body={body} messageType={messageType} media={message.media} channel={message.channel} />
        <MessageTimestamp sentAt={sentAt} />
      </div>
    </div>
  )
}



function MessageContent({
  body,
  messageType,
  media,
  channel,
}: {
  body?: string
  messageType: CachedMessage["messageType"]
  media?: MessageMedia
  channel: MessageChannel
}) {
  // Audio messages: render the player if we have a mediaId
  if (messageType === "AUDIO" && media?.whatsappMediaId) {
    return <AudioPlayer channel={channel} mediaId={media.whatsappMediaId} />
  }

  // Image messages: render the viewer + optional lightbox
  if (messageType === "IMAGE" && media?.whatsappMediaId) {
    return <ImageViewer channel={channel} mediaId={media.whatsappMediaId} caption={media.caption} />
  }

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

function ReferralLabel({referral}: {referral?: MessageReferral}) {
  const referralType = detectReferralPlatform(referral)
  if (referralType === ReferralType.Unknown) return;

  return (
    <div className="flex items-center gap-1 mb-1">
      {referralType === ReferralType.Facebook
        ?
        <FacebookIcon className="w-4 h-4"/>
        :
        <InstagramIcon className="w-4 h-4"/>
      }
      <span className="text-gray-500">Referido</span>
    </div>
  )
}

function detectReferralPlatform(referral?: MessageReferral): ReferralType {
  const url = referral?.sourceUrl?.toLowerCase();
  if (!url) return ReferralType.Unknown;

  // Check for Facebook patterns
  if (url.includes('fb') || url.includes('facebook')) {
    return ReferralType.Facebook;
  }

  // Check for Instagram patterns
  if (url.includes('instagr.am') || url.includes('instagram')) {
    return ReferralType.Instagram;
  }

  return ReferralType.Unknown;
}



