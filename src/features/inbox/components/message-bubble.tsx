import { FacebookIcon } from "@/components/icons/FacebookIcon"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CachedMessage } from "@/lib/db/schema"
import type { MessageChannel, MessageMedia, MessageReferral } from "@/types/message.type"
import { useIsMobile } from "@/hooks/use-mobile"
import { BotIcon, UserIcon } from "lucide-react"
import { AudioPlayer } from "./audio-player"
import { ImageViewer } from "./image-viewer"
import { getAvatarBackgroundColor } from "@/utils/colors"

interface MessageBubbleProps {
  message: CachedMessage;
  customerId?: string;
  searchQuery?: string;
  isCurrentMatch?: boolean;
  localBlobUrl?: string;
}

enum ReferralType {
  Facebook = 'facebook',
  Instagram = 'instagram',
  Unknown = 'unknown',
}

const MEDIA_TYPES = new Set(["AUDIO", "IMAGE", "VIDEO", "DOCUMENT"])

export const MessageBubble = ({ message, customerId, searchQuery, isCurrentMatch, localBlobUrl }: MessageBubbleProps) => {
  const { direction, body, messageType, sentAt, sender } = message
  const isOutbound = direction === "OUTBOUND"
  const isBotMessage = sender.type === 'BOT';
  const isMobile = useIsMobile()
  const isMedia = MEDIA_TYPES.has(messageType)

  const maxWidth = isMobile
    ? (isMedia ? "max-w-[90%]" : "max-w-[80%]")
    : (isMedia ? "max-w-[60%]" : "max-w-[50%]")

  return (
    <div className={`flex gap-2 ${isOutbound ? "flex-row-reverse" : ""}`}>
      <Avatar className={`flex shadow-sm items-center justify-center w-10 h-10 shrink-0 ${isBotMessage ? 'bg-[#d4f1ff] dark:bg-blue-900/40' : ''}`}>
        {isBotMessage
          ?
          <BotIcon className="w-6 h-6"/>
          :
          <Avatar className={`${getAvatarBackgroundColor(customerId || 'undefined')} flex justify-center items-center w-12 h-12`}>
            <UserIcon className="text-white"/>
          </Avatar>
        }
      </Avatar>
      <div
        className={`px-4 py-2 rounded-lg shadow-sm text-sm ${maxWidth} min-w-0 ${
          isOutbound ? "bg-[#d4f1ff] dark:bg-blue-900/40" : "bg-white dark:bg-card"
        } ${isCurrentMatch ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""}`}
      >
        <ReferralLabel referral={message.referral}/>
        <MessageContent body={body} messageType={messageType} media={message.media} channel={message.channel} searchQuery={searchQuery} localBlobUrl={localBlobUrl} />
        <MessageTimestamp sentAt={sentAt} />
      </div>
    </div>
  )
}



function highlightText(text: string, query: string) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-700 rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </>
  )
}

function MessageContent({
  body,
  messageType,
  media,
  channel,
  searchQuery,
  localBlobUrl,
}: {
  body?: string
  messageType: CachedMessage["messageType"]
  media?: MessageMedia
  channel: MessageChannel
  searchQuery?: string
  localBlobUrl?: string
}) {
  if (messageType === "AUDIO" && (media?.id || media?.whatsappMediaId || media?.url)) {
    return <AudioPlayer channel={channel} mediaId={media.id ?? media.whatsappMediaId ?? ""} directUrl={media.url} />
  }

  if (messageType === "IMAGE" && (media?.id || media?.whatsappMediaId || media?.url)) {
    return <ImageViewer channel={channel} mediaId={media.id ?? media.whatsappMediaId ?? ""} directUrl={media.url} caption={media.caption} localBlobUrl={localBlobUrl} />
  }

  if (body) {
    return <p className="wrap-break-word whitespace-pre-wrap">{searchQuery ? highlightText(body, searchQuery) : body}</p>
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
  return <p className="text-gray-500 dark:text-gray-400 italic">{label}</p>
}

function MessageTimestamp({ sentAt }: { sentAt: number }) {
  const formatted = new Intl.DateTimeFormat("es-VE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(sentAt))

  return (
    <span className="flex justify-end text-gray-500 dark:text-gray-400 text-xs mt-1">
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
      <span className="text-gray-500 dark:text-gray-400">Referido</span>
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



