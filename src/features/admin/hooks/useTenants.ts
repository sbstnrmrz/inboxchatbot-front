import { useQuery } from "@tanstack/react-query"
import { tenantsQueries } from "@/features/admin/api/tenants.queries"
import { tenantQueryKeys } from "../api/tenants.query-keys"

export function useTenants() {
  return useQuery({
    queryKey: tenantQueryKeys.all(),
    queryFn: tenantsQueries.list,
  })
}
