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
  mapCustomerToCache,
  mapCustomersToCache,
  mapMessageToCache,
} from "@/lib/sync/mappers"
import { customersRepository } from "@/lib/db/repositories/customers.repository"
import type { CachedConversation } from "@/lib/db/schema"
import type { Conversation } from "@/types/conversation.type"
import { db } from "@/lib/db/database"

/**
 * Persist a list of conversations returned by the API into IndexedDB.
 * Also persists the populated lastMessage of each conversation so the
 * inbox list can show message previews without a separate messages fetch.
 *
 * Stale removal is intentionally omitted here — server-side deletions are
 * handled in real time via the conversation_deleted socket event, which calls
 * removeConversation(). Deleting based on a partial first page would wrongly
 * evict conversations loaded on page 2+ (and their messages) whenever the
 * conversations list is refetched.
 */
export async function syncConversations(conversations: Conversation[]): Promise<void> {
  if (conversations.length === 0) return

  await db.transaction("rw", db.conversations, db.messages, async () => {
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

  // Sync inline customers outside the conversations transaction
  const customers = mapCustomersToCache(conversations.map((c) => c.customer))
  await customersRepository.upsertMany(customers)
}

/**
 * Persist a page of conversations (pagination — subsequent pages).
 * Only upserts — never removes stale rows, so previously loaded pages
 * are preserved in the local cache.
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

  // Sync inline customers
  const customers = mapCustomersToCache(conversations.map((c) => c.customer))
  await customersRepository.upsertMany(customers)
}

/**
 * Persist a single conversation (e.g. received via socket event).
 * Also persists its lastMessage if populated.
 */
export async function syncConversation(conversation: Conversation): Promise<void> {
  // Sync the customer first so it's in IndexedDB before Dexie reactivity fires
  // from the conversation write and the chat list item renders.
  await customersRepository.upsert(mapCustomerToCache(conversation.customer))

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
