import { useQuery } from "@tanstack/react-query"
import { tenantsApi } from "@/features/admin/api/tenants.api"
import { queryKeys } from "@/lib/query-keys"

export function useTenants() {
  return useQuery({
    queryKey: queryKeys.tenants.all(),
    queryFn: tenantsApi.list,
  })
}
