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
import { db } from "@/lib/db/database"

/**
 * Persist a list of conversations returned by the API into IndexedDB.
 * Also persists the populated lastMessage of each conversation so the
 * inbox list can show message previews without a separate messages fetch.
 *
 * Stale conversations (present in IndexedDB but absent from the server
 * response) are removed together with their orphaned messages, so deleted
 * records on the server are reflected locally on the next sync.
 */
export async function syncConversations(conversations: Conversation[]): Promise<void> {
  const incomingIds = new Set(conversations.map((c) => c._id))

  // Determine which locally-cached conversations no longer exist on the server
  const existingRows = await db.conversations.toArray()
  const staleIds = existingRows.map((r) => r.id).filter((id) => !incomingIds.has(id))

  await db.transaction("rw", db.conversations, db.messages, async () => {
    // Remove stale conversations and their associated messages in one transaction
    if (staleIds.length > 0) {
      await db.conversations.bulkDelete(staleIds)
      for (const staleId of staleIds) {
        await db.messages.where("conversationId").equals(staleId).delete()
      }
    }

    if (conversations.length === 0) return

    const cachedConversations = mapConversationsToCache(conversations)
    await db.conversations.bulkPut(cachedConversations)

    // Extract and persist populated lastMessage objects
    const lastMessages = conversations
      .map((c) => c.lastMessage)
      .filter((m): m is NonNullable<typeof m> => !!m)
      .map(mapMessageToCache)

    if (lastMessages.length > 0) {
      await db.messages.bulkPut(lastMessages)
    }
  })
}

/**
 * Persist a page of conversations (pagination — NOT the first page).
 * Only upserts — never removes stale rows, so previously loaded pages
 * are preserved in the local cache.
 *
 * Call this for all pages after the first; use `syncConversations` for
 * the initial page which handles stale-deletion.
 */
export async function syncConversationsPage(conversations: Conversation[]): Promise<void> {
  if (conversations.length === 0) return

  await db.transaction("rw", db.conversations, db.messages, async () => {
    const cachedConversations = mapConversationsToCache(conversations)
    await db.conversations.bulkPut(cachedConversations)

    const lastMessages = conversations
      .map((c) => c.lastMessage)
      .filter((m): m is NonNullable<typeof m> => !!m)
      .map(mapMessageToCache)

    if (lastMessages.length > 0) {
      await db.messages.bulkPut(lastMessages)
    }
  })
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
 * Remove a conversation and its associated messages from the local cache.
 * Called when a `conversation_deleted` socket event arrives.
 */
export async function removeConversation(id: string): Promise<void> {
  await db.transaction("rw", db.conversations, db.messages, async () => {
    await db.conversations.delete(id)
    await db.messages.where("conversationId").equals(id).delete()
  })
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
