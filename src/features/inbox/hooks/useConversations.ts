/**
 * useConversations — fetch and cache the conversations list with infinite scroll.
 *
 * Uses cursor-based pagination via the `before` param (ISO timestamp of
 * `lastMessageAt`). Each page is synced into IndexedDB on arrival.
 * The first page also removes stale local rows; subsequent pages only upsert.
 *
 * UI components import only this hook — never apiClient or repositories directly.
 */

import { useInfiniteQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { conversationsQueries } from "@/features/inbox/api/conversations.queries"
import { syncConversations, syncConversationsPage } from "@/lib/sync"
import type { Conversation } from "@/types/conversation.type"

const PAGE_SIZE = 50

interface UseConversationsOptions {
  enabled?: boolean
}

export function useConversations({ enabled = true }: UseConversationsOptions = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.list(),
    enabled,
    initialPageParam: undefined as Date | undefined,
    queryFn: async ({ pageParam }) => {
      const conversations = await conversationsQueries.list({
        limit: PAGE_SIZE,
        before: pageParam instanceof Date ? pageParam.toISOString() : undefined,
      })

      if (pageParam === undefined) {
        // First page: full sync — removes stale rows + upserts incoming
        syncConversations(conversations).catch(console.error)
      } else {
        // Subsequent pages: additive upsert only, never delete
        syncConversationsPage(conversations).catch(console.error)
      }

      return conversations
    },
    getNextPageParam: (lastPage: Conversation[]) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      // Cursor = lastMessageAt of the oldest conversation in this page
      const last = lastPage[lastPage.length - 1]
      return last.lastMessageAt instanceof Date ? last.lastMessageAt : undefined
    },
  })
}
