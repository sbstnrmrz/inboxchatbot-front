/**
 * Conversation sync helpers — bridge between TanStack Query and IndexedDB.
 *
 * Call these from `onSuccess` / `placeholderData` in TanStack Query hooks.
 * Never call them from UI components directly.
 */

import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import { messagesRepository } from "@/lib/db/repositories/messages.repository"
import {
  mapConversationToCache,
  mapConversationsToCache,
  mapMessageToCache,
} from "@/lib/sync/mappers"
import type { CachedConversation } from "@/lib/db/schema"
import type { Conversation } from "@/types/conversation.type"

/**
 * Persist a list of conversations returned by the API into IndexedDB.
 * Also persists the populated lastMessage of each conversation so the
 * inbox list can show message previews without a separate messages fetch.
 */
export async function syncConversations(conversations: Conversation[]): Promise<void> {
  if (conversations.length === 0) return

  const cachedConversations = mapConversationsToCache(conversations)
  await conversationsRepository.upsertMany(cachedConversations)

  // Extract and persist populated lastMessage objects
  const lastMessages = conversations
    .map((c) => c.lastMessage)
    .filter((m): m is NonNullable<typeof m> => !!m)
    .map(mapMessageToCache)

  if (lastMessages.length > 0) {
    await messagesRepository.upsertMany(lastMessages)
  }
}

/**
 * Persist a single conversation (e.g. received via socket event).
 * Also persists its lastMessage if populated.
 */
export async function syncConversation(conversation: Conversation): Promise<void> {
  const cached = mapConversationToCache(conversation)
  await conversationsRepository.upsert(cached)

  if (conversation.lastMessage) {
    await messagesRepository.upsert(mapMessageToCache(conversation.lastMessage))
  }
}

/**
 * Remove a conversation from the local cache (e.g. after deletion event).
 */
export async function removeConversation(id: string): Promise<void> {
  await conversationsRepository.delete(id)
}

/**
 * Update only the fields that change frequently without a full re-fetch:
 * unread count, last message preview, bot status, etc.
 *
 * Called when a socket `conversation_updated` event arrives.
 */
export async function patchConversation(
  id: string,
  changes: Partial<Omit<CachedConversation, "id">>,
): Promise<void> {
  await conversationsRepository.patch(id, changes)
}
