import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersQueries } from "@/features/admin/api/users.queries"
import { userQueryKeys } from "@/features/admin/api/users.query-keys"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersQueries.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all() })
    },
  })
}
