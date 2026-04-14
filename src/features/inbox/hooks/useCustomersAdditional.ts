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
  page?: number
  limit?: number
}

export function useCustomersAdditional({ enabled = true, search, page = 1, limit = 20 }: UseCustomersAdditionalOptions = {}) {
  return useQuery({
    queryKey: queryKeys.customers.additional({ search, page, limit }),
    enabled,
    queryFn: () => customersAdditionalQueries.list({ search, page, limit }),
    staleTime: 0,
  })
}
