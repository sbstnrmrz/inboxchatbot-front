export type MessageChannel = "WHATSAPP" | "INSTAGRAM"

export type MessageDirection = "INBOUND" | "OUTBOUND"

export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "FAILED"

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "AUDIO"
  | "VIDEO"
  | "DOCUMENT"
  | "STICKER"
  | "LOCATION"
  | "CONTACTS"
  | "INTERACTIVE"
  | "BUTTON"
  | "REACTION"
  | "ORDER"
  | "REEL"
  | "SHARE"
  | "POSTBACK"
  | "SYSTEM"
  | "UNKNOWN"

export type SenderType = "CUSTOMER" | "USER" | "BOT"

export interface MessageSender {
  type: SenderType
  /** Absent when type is BOT */
  id?: string
}

export interface MessageMedia {
  whatsappMediaId?: string
  url?: string
  mimeType?: string
  sha256?: string
  caption?: string
  filename?: string
  size?: number
}

export interface MessageReferral {
  sourceUrl?: string
  sourceType?: string
  sourceId?: string
  headline?: string
  body?: string
  ref?: string
  mediaType?: string
  imageUrl?: string
  videoUrl?: string
  thumbnailUrl?: string
}

export interface Message {
  _id: string
  tenantId: string
  conversationId: string
  channel: MessageChannel
  direction: MessageDirection
  messageType: MessageType
  sender: MessageSender
  body?: string
  media?: MessageMedia
  externalId?: string
  status: MessageStatus
  /** Channel timestamp (not server time) */

  deliveredAt?: string
  readAt?: Date 
  sentAt: Date 
  referral?: MessageReferral
  createdAt?: Date 
  updatedAt?: Date 
}
