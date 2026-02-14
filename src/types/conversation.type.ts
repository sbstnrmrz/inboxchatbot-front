import type { Message } from "@/types/message.type"

export type ConversationChannel = "WHATSAPP" | "INSTAGRAM"

export type ConversationStatus = "OPEN" | "PENDING" | "CLOSED"

export interface Conversation {
  _id: string
  tenantId: string
  customerId: string
  channel: ConversationChannel
  status: ConversationStatus
  /** Populated Message object when fetched from API */
  lastMessage?: Message
  lastMessageAt?: string
  unreadCount: number
  requestingAgent: boolean
  botEnabled: boolean
  botDisabledAt?: string
  createdAt?: string
  updatedAt?: string
}
