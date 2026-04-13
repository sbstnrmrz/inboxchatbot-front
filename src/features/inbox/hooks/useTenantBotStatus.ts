import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { tenantsQueries } from "@/features/admin/api/tenants.queries"
import { tenantQueryKeys } from "@/features/admin/api/tenants.query-keys"

export function useTenantBotStatus() {
  return useQuery({
    queryKey: tenantQueryKeys.botStatus(),
    queryFn: tenantsQueries.getBotStatus,
  })
}

export function useToggleTenantBot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tenantsQueries.toggleBot,
    onSuccess: ({ botEnabled }) => {
      queryClient.setQueryData(tenantQueryKeys.botStatus(), { botEnabled })
    },
  })
}
