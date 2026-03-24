/**
 * Mappers — convert server API objects to Dexie cached shapes.
 *
 * These are pure functions with no side effects.
 * They live here so repositories stay free of business logic.
 */

import type { Customer } from "@/types/customer.type"
import type { Conversation } from "@/types/conversation.type"
import type { Message } from "@/types/message.type"
import type {
  CachedCustomer,
  CachedConversation,
  CachedMessage,
} from "@/lib/db/schema"

// ─── Customer ─────────────────────────────────────────────────────────────────

export function mapCustomerToCache(customer: Customer): CachedCustomer {
  return {
    id: customer._id,
    tenantId: customer.tenantId,
    name: customer.name,
    whatsappId: customer.whatsappInfo?.id,
    instagramAccountId: customer.instagramInfo?.accountId,
    isBlocked: customer.isBlocked,
    cachedAt: Date.now(),
  }
}

export function mapCustomersToCache(customers: Customer[]): CachedCustomer[] {
  return customers.map(mapCustomerToCache)
}

// ─── Conversation ─────────────────────────────────────────────────────────────

/** Derive a short text preview from the last message for inbox list display. */
function deriveLastMessagePreview(conversation: Conversation): string | undefined {
  const msg = conversation.lastMessage
  if (!msg) return undefined

  // Always prefer body text when available
  if (msg.body) {
    return msg.body.length > 80 ? `${msg.body.slice(0, 80)}…` : msg.body
  }

  // Only fall back to media label when there is no body
  const mediaLabels: Partial<Record<string, string>> = {
    IMAGE: "📷 Imagen",
    AUDIO: "🎵 Audio",
    VIDEO: "🎬 Video",
    DOCUMENT: "📄 Documento",
    STICKER: "🏷️ Sticker",
    LOCATION: "📍 Ubicación",
    CONTACTS: "👤 Contacto",
  }

  return mediaLabels[msg.messageType]
}

export function mapConversationToCache(conversation: Conversation): CachedConversation {
  const lastMessageAt = conversation.lastMessageAt
    ? new Date(conversation.lastMessageAt)
    : undefined

  return {
    id: conversation._id,
    tenantId: conversation.tenantId,
    customerId: conversation.customerId,
    channel: conversation.channel,
    status: conversation.status,
    lastMessageId: conversation.lastMessage?._id,
    lastMessagePreview: deriveLastMessagePreview(conversation),
    lastMessageAt,
    unreadCount: conversation.unreadCount,
    requestingAgent: conversation.requestingAgent,
    botEnabled: conversation.botEnabled,
    tags: conversation.tags,
    cachedAt: Date.now(),
  }
}

export function mapConversationsToCache(
  conversations: Conversation[],
): CachedConversation[] {
  return conversations.map(mapConversationToCache)
}

// ─── Message ──────────────────────────────────────────────────────────────────

export function mapMessageToCache(message: Message): CachedMessage {
  return {
    id: message._id,
    tenantId: message.tenantId,
    conversationId: message.conversationId,
    channel: message.channel,
    direction: message.direction,
    messageType: message.messageType,
    sender: message.sender,
    body: message.body,
    media: message.media,
    externalId: message.externalId,
    status: message.status,
    sentAt: new Date(message.sentAt).getTime(),
    deliveredAt: message.deliveredAt
      ? new Date(message.deliveredAt).getTime()
      : undefined,
    readAt: message.readAt ? new Date(message.readAt).getTime() : undefined,
    referral: message.referral,
    cachedAt: Date.now(),
  }
}

export function mapMessagesToCache(messages: Message[]): CachedMessage[] {
  return messages.map(mapMessageToCache)
}
