import { useMutation } from "@tanstack/react-query"
import { tagsQueries } from "@/features/inbox/api/tags.queries"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"

export function useAddTagToConversation(conversationId: string) {
  return useMutation({
    mutationFn: (tagId: string) => tagsQueries.addToConversation(conversationId, tagId),
    onSuccess: ({ tags }) => {
      conversationsRepository.patch(conversationId, { tags })
    },
  })
}

export function useRemoveTagFromConversation(conversationId: string) {
  return useMutation({
    mutationFn: (tagId: string) => tagsQueries.removeFromConversation(conversationId, tagId),
    onSuccess: ({ tags }) => {
      conversationsRepository.patch(conversationId, { tags })
    },
  })
}
