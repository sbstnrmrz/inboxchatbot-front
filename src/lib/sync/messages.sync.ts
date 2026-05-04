/**
 * Message sync helpers — bridge between TanStack Query and IndexedDB.
 *
 * Call these from `onSuccess` in TanStack Query hooks or from socket handlers.
 * Never call them from UI components directly.
 */

import { messagesRepository } from "@/lib/db/repositories/messages.repository"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import { mapMessageToCache, mapMessagesToCache } from "@/lib/sync/mappers"
import type { Message, MessageStatus } from "@/types/message.type"

/**
 * Persist a page of messages returned by the API into IndexedDB.
 * Typically called in `onSuccess` of the messages list / infinite query.
 */
export async function syncMessages(messages: Message[]): Promise<void> {
  if (messages.length === 0) return
  const cached = mapMessagesToCache(messages)
  await messagesRepository.upsertMany(cached)
}

/**
 * Persist a single message (e.g. received via `message_received` socket event).
 * Also patches the conversation's lastMessageAt so the inbox list re-sorts
 * immediately without waiting for the next server refetch.
 */
export async function syncMessage(message: Message): Promise<void> {
  const cached = mapMessageToCache(message)
  await messagesRepository.upsert(cached)

  // Keep inbox order up-to-date in real time
  const sentAt = new Date(message.sentAt)
  await conversationsRepository.patch(message.conversationId, {
    lastMessageAt: sentAt,
  })
}

/**
 * Update message delivery/read status from a webhook status update.
 */
export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
  timestamps?: { deliveredAt?: number; readAt?: number },
): Promise<void> {
  await messagesRepository.updateStatus(id, status, timestamps)
}

/**
 * Remove all cached messages for a conversation (e.g. after conversation deletion).
 */
export async function clearConversationMessages(conversationId: string): Promise<void> {
  await messagesRepository.clearByConversation(conversationId)
}

/**
 * Persist the backend storage URL on an outbound media message so future
 * renders can fetch it without relying on the transient WhatsApp media ID.
 */
export async function patchMessageMediaUrl(id: string, url: string): Promise<void> {
  await messagesRepository.patchMedia(id, { url })
}
