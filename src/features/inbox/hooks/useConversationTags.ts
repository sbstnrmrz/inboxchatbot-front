import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { tagsQueries } from "@/features/inbox/api/tags.queries"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"

export function useAddTagToConversation(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tagId: string) => tagsQueries.addToConversation(conversationId, tagId),
    onSuccess: ({ tags }) => {
      conversationsRepository.patch(conversationId, { tags })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
    },
  })
}

export function useRemoveTagFromConversation(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tagId: string) => tagsQueries.removeFromConversation(conversationId, tagId),
    onSuccess: ({ tags }) => {
      conversationsRepository.patch(conversationId, { tags })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
    },
  })
}
