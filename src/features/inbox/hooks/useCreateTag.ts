import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { tagsQueries } from "@/features/inbox/api/tags.queries"

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tagsQueries.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() })
    },
  })
}
