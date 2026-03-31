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
import { customersQueries } from "@/features/inbox/api/customers.queries"
import { syncConversations, syncConversationsPage } from "@/lib/sync"
import { syncCustomer } from "@/lib/sync/customers.sync"
import { customersRepository } from "@/lib/db/repositories/customers.repository"
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
        await syncConversations(conversations)
      } else {
        await syncConversationsPage(conversations)
      }

      // After syncing conversations, fetch any customers not yet in IndexedDB.
      // This covers the case where a new conversation (with a new customer)
      // appears via this refetch before the socket event handler had a chance
      // to cache the customer.
      const missingIds = (
        await Promise.all(
          conversations.map(async (c) => {
            if (!c.customerId) return null
            const cached = await customersRepository.getById(c.customerId).catch(() => undefined)
            return cached ? null : c.customerId
          }),
        )
      ).filter((id): id is string => id !== null)

      if (missingIds.length > 0) {
        await Promise.allSettled(
          missingIds.map((id) =>
            customersQueries.getById(id).then((c) => syncCustomer(c)).catch(() => {}),
          ),
        )
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
