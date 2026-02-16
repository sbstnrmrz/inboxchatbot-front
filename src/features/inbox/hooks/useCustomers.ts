/**
 * useCustomers — fetch and cache the customers list.
 *
 * On success, syncs data into IndexedDB via the sync layer.
 * UI components import only this hook — never apiClient or repositories directly.
 */

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { customersQueries } from "@/features/inbox/api/customers.queries"
import { syncCustomers } from "@/lib/sync"

interface UseCustomersOptions {
  enabled?: boolean
}

export function useCustomers({ enabled = true }: UseCustomersOptions = {}) {
  return useQuery({
    queryKey: queryKeys.customers.list(),
    enabled,
    queryFn: async () => {
      const customers = await customersQueries.list({ limit: 100 })
      syncCustomers(customers).catch(console.error)
      return customers
    },
  })
}
