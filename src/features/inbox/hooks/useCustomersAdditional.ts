/**
 * useCustomersAdditional — fetch customers with extra computed fields
 * (messageCount, etc.) from GET /customers/additional.
 *
 * UI components import only this hook — never apiClient directly.
 */

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { customersAdditionalQueries } from "@/features/inbox/api/customers-additional.queries"

interface UseCustomersAdditionalOptions {
  enabled?: boolean
  search?: string
}

export function useCustomersAdditional({ enabled = true, search }: UseCustomersAdditionalOptions = {}) {
  return useQuery({
    queryKey: queryKeys.customers.additional(search),
    enabled,
    queryFn: () => customersAdditionalQueries.list({ search }),
    staleTime: 0,
  })
}
