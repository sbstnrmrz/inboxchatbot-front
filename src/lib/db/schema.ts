/**
 * Dexie / IndexedDB cached entity shapes.
 *
 * These types describe what is stored locally — they mirror the server types
 * but are flattened where needed for efficient IndexedDB indexing.
 *
 * Rules:
 *  - All tables are tenant-isolated (tenantId in every row + compound indexes).
 *  - IndexedDB is a cache / UX layer, NOT the source of truth.
 *  - Server state (TanStack Query) always wins on conflict.
 *  - UI components must never import from this file directly.
 */

import type { ConversationChannel, ConversationStatus } from "@/types/conversation.type"
import type {
  MessageChannel,
  MessageDirection,
  MessageMedia,
  MessageReferral,
  MessageSender,
  MessageStatus,
  MessageType,
} from "@/types/message.type"

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface CachedCustomer {
  /** Maps to server _id */
  id: string
  tenantId: string
  name: string
  /** Flattened from whatsappInfo.id — indexed for fast lookup */
  whatsappId?: string
  /** Flattened from instagramInfo.accountId — indexed for fast lookup */
  instagramAccountId?: string
  instagramUsername?: string
  email?: string
  isBlocked: boolean
  /** Unix ms — used to detect stale cache */
  cachedAt: number
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface CachedConversation {
  /** Maps to server _id */
  id: string
  tenantId: string
  customerId: string
  channel: ConversationChannel
  status: ConversationStatus
  /** ID of the last message — for reference only, not full object */
  lastMessageId?: string
  /** Preview text derived from lastMessage.body or media type */
  lastMessagePreview?: string
  /** Unix ms — used for inbox sort order (mirrors server lastMessageAt) */
  lastMessageAt?: Date 
  unreadCount: number
  requestingAgent: boolean
  botEnabled: boolean
  /** Tag IDs applied to this conversation */
  tags?: string[]
  /** Unix ms */
  cachedAt: number
}

// ─── Message ──────────────────────────────────────────────────────────────────

export interface CachedMessage {
  /** Maps to server _id */
  id: string
  tenantId: string
  conversationId: string
  channel: MessageChannel
  direction: MessageDirection
  messageType: MessageType
  sender: MessageSender
  body?: string
  media?: MessageMedia
  externalId?: string
  execId?: string
  status: MessageStatus
  /** Unix ms — channel timestamp, mirrors server sentAt */
  sentAt: number
  deliveredAt?: number
  readAt?: number
  referral?: MessageReferral
  /** Unix ms */
  cachedAt: number
}

// ─── Draft ───────────────────────────────────────────────────────────────────

export interface CachedDraft {
  /**
   * Compound primary key: `${tenantId}:${conversationId}`
   * Stored as a single string so Dexie can use it as PK directly.
   */
  id: string
  tenantId: string
  conversationId: string
  body: string
  /** Unix ms */
  updatedAt: number
}

// ─── Sync metadata ────────────────────────────────────────────────────────────

export interface SyncMeta {
  /**
   * Composite key: `${tenantId}:${entity}`
   * Examples: "acme:conversations", "acme:messages:conv123"
   */
  id: string
  tenantId: string
  entity: string
  /** Unix ms of the last successful full-sync for this entity */
  lastSyncedAt: number
}
