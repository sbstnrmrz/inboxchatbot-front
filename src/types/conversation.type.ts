import type { Message } from "@/types/message.type"
import type { Customer } from "@/types/customer.type"

export type ConversationChannel = "WHATSAPP" | "INSTAGRAM"

export type ConversationStatus = "OPEN" | "PENDING" | "CLOSED"

export interface Conversation {
  _id: string
  tenantId: string
  customer: Customer
  channel: ConversationChannel
  status: ConversationStatus
  /** Populated Message object when fetched from API */
  lastMessage?: Message
  lastMessageAt?: Date
  unreadCount: number
  requestingAgent: boolean
  botEnabled: boolean
  botDisabledAt?: string
  /** Array of tag IDs applied to this conversation */
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}
