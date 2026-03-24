import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { tagsQueries } from "@/features/inbox/api/tags.queries"

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tagsQueries.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() })
    },
  })
}
