/**
 * useMessages — fetch and cache messages for a specific conversation.
 *
 * Lazy: only fires when a conversationId is provided (i.e. user opens a chat).
 * On success, syncs data into IndexedDB via the sync layer.
 * UI components import only this hook — never apiClient or repositories directly.
 */

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { messagesQueries } from "@/features/inbox/api/messages.queries"
import { syncMessages } from "@/lib/sync"

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.byConversation(conversationId ?? ""),
    enabled: !!conversationId,
    queryFn: async () => {
      const response = await messagesQueries.byConversation(conversationId!, {
        limit: 50,
      })
      syncMessages(response.data).catch(console.error)
      return response
    },
  })
}
