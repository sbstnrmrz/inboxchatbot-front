/**
 * useLiveMessages — reactive read of messages for a conversation from IndexedDB.
 *
 * Re-renders automatically whenever the messages table changes for the given
 * conversationId (e.g. after useMessages syncs new data or a socket event
 * inserts a new message).
 *
 * This hook only reads from IndexedDB — server fetching is handled by useMessages.
 * UI components should use both together:
 *   - useMessages(conversationId)  → triggers fetch + sync on mount
 *   - useLiveMessages(conversationId) → provides reactive data for rendering
 */

import { useLiveQuery } from "dexie-react-hooks"
import { messagesRepository } from "@/lib/db/repositories/messages.repository"
import type { CachedMessage } from "@/lib/db/schema"

export function useLiveMessages(conversationId: string | undefined): CachedMessage[] {
  return (
    useLiveQuery(
      () =>
        conversationId
          ? messagesRepository.getRecentByConversation(conversationId, 50)
          : Promise.resolve([]),
      [conversationId],
    ) ?? []
  )
}
