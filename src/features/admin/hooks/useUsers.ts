import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { userQueryKeys } from "@/features/admin/api/users.query-keys"

type User = typeof authClient.$Infer.Session.user & Record<string, unknown>

export function useUsers() {
  return useQuery({
    queryKey: userQueryKeys.all(),
    queryFn: async (): Promise<User[]> => {
      const result = await authClient.admin.listUsers({
        query: {},
      })
      if (result.error) {
        throw new Error(result.error.message ?? "Error al obtener usuarios")
      }
      return (result.data?.users ?? []) as User[]
    },
  })
}
