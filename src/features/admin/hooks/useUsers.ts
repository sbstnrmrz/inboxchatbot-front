import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { userQueryKeys } from "@/features/admin/api/users.query-keys"

export function useUsers() {
  return useQuery({
    queryKey: userQueryKeys.all(),
    queryFn: async () => {
      const result = await authClient.admin.listUsers({
        query: {},
      })
      if (result.error) {
        throw new Error(result.error.message ?? "Error al obtener usuarios")
      }
      return result.data?.users ?? []
    },
  })
}
