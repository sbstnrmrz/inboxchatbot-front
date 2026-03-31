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

const PAGE_SIZE = 10

interface UseConversationsOptions {
  enabled?: boolean
}

export function useConversations({ enabled = true }: UseConversationsOptions = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.list(),
    enabled,
    initialPageParam: undefined as Date | undefined,
    queryFn: async ({ pageParam }) => {
      const before = pageParam instanceof Date ? pageParam.toISOString() : undefined
      console.log('[useConversations] queryFn', { pageParam, before })

      const conversations = await conversationsQueries.list({ limit: PAGE_SIZE, before })
      console.log('[useConversations] fetched', conversations.length, 'conversations')

      if (pageParam === undefined) {
        syncConversations(conversations).catch(console.error)
      } else {
        syncConversationsPage(conversations).catch(console.error)
      }

      return conversations
    },
    getNextPageParam: (lastPage: Conversation[]) => {
      console.log('[useConversations] getNextPageParam — lastPage.length:', lastPage.length, 'PAGE_SIZE:', PAGE_SIZE)
      if (lastPage.length < PAGE_SIZE) {
        console.log('[useConversations] no more pages')
        return undefined
      }
      const last = lastPage[lastPage.length - 1]
      console.log('[useConversations] last.lastMessageAt:', last.lastMessageAt, typeof last.lastMessageAt)
      if (!last.lastMessageAt) return undefined
      const date = new Date(last.lastMessageAt)
      console.log('[useConversations] next cursor:', date)
      return isNaN(date.getTime()) ? undefined : date
    },
  })
}
