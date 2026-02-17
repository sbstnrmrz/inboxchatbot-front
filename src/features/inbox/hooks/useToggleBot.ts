import { useMutation, useQueryClient } from "@tanstack/react-query"
import { conversationsQueries } from "@/features/inbox/api/conversations.queries"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import { queryKeys } from "@/lib/query-keys"
import type { Conversation } from "@/types/conversation.type"

export function useToggleBot(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => conversationsQueries.toggleBot(conversationId),
    onSuccess: ({ botEnabled }) => {
      // 1. Patch IndexedDB — useLiveConversations re-renders automatically
      conversationsRepository.patch(conversationId, { botEnabled }).catch(console.error)

      // 2. Patch TanStack Query list cache — no re-fetch needed
      queryClient.setQueryData<Conversation[]>(
        queryKeys.conversations.list(),
        (prev) =>
          prev?.map((c) =>
            c._id === conversationId ? { ...c, botEnabled } : c,
          ),
      )
    },
  })
}
