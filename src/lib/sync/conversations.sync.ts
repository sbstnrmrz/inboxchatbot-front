/**
 * Conversation sync helpers — bridge between TanStack Query and IndexedDB.
 *
 * Call these from `onSuccess` / `placeholderData` in TanStack Query hooks.
 * Never call them from UI components directly.
 */

import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import { mapConversationToCache, mapConversationsToCache } from "@/lib/sync/mappers"
import type { CachedConversation } from "@/lib/db/schema"
import type { Conversation } from "@/types/conversation.type"

/**
 * Persist a list of conversations returned by the API into IndexedDB.
 * Typically called in `onSuccess` of the conversations list query.
 */
export async function syncConversations(conversations: Conversation[]): Promise<void> {
  if (conversations.length === 0) return
  const cached = mapConversationsToCache(conversations)
  await conversationsRepository.upsertMany(cached)
}

/**
 * Persist a single conversation (e.g. received via socket event).
 */
export async function syncConversation(conversation: Conversation): Promise<void> {
  const cached = mapConversationToCache(conversation)
  await conversationsRepository.upsert(cached)
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
