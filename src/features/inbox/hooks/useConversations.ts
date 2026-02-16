/**
 * useConversations — fetch and cache the conversations list.
 *
 * On success, syncs data into IndexedDB via the sync layer.
 * UI components import only this hook — never apiClient or repositories directly.
 */

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { conversationsQueries } from "@/features/inbox/api/conversations.queries"
import { syncConversations } from "@/lib/sync"

interface UseConversationsOptions {
  enabled?: boolean
}

export function useConversations({ enabled = true }: UseConversationsOptions = {}) {
  return useQuery({
    queryKey: queryKeys.conversations.list(),
    enabled,
    queryFn: async () => {
      const conversations = await conversationsQueries.list({ limit: 50 })
      // Fire-and-forget sync to IndexedDB — do not await to avoid blocking UI
      syncConversations(conversations).catch(console.error)
      return conversations
    },
  })
}
