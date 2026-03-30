import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { conversationsQueries } from "@/features/inbox/api/conversations.queries"
import { mapConversationsToCache } from "@/lib/sync/mappers"

export function useConversationSearch(search: string) {
  const trimmed = search.trim()
  return useQuery({
    queryKey: queryKeys.conversations.list({ search: trimmed }),
    enabled: trimmed.length > 0,
    queryFn: async () => {
      const conversations = await conversationsQueries.list({ search: trimmed, limit: 30 })
      return mapConversationsToCache(conversations)
    },
  })
}
