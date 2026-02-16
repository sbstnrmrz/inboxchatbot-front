/**
 * Customer query functions — pure async fetchers, no hooks, no UI.
 *
 * Only import from hooks (useCustomers, useInitialSync).
 */

import { apiClient } from "@/lib/api/client"
import type { Customer } from "@/types/customer.type"

export interface CustomersListParams {
  before?: string
  limit?: number
}

export const customersQueries = {
  /**
   * Fetch a page of customers.
   * Pass `before` cursor for subsequent pages.
   */
  list: (params?: CustomersListParams): Promise<Customer[]> => {
    const searchParams = new URLSearchParams()
    if (params?.before) searchParams.set("before", params.before)
    if (params?.limit) searchParams.set("limit", String(params.limit))
    const query = searchParams.toString()
    return apiClient.get<Customer[]>(
      query ? `/customers?${query}` : "/customers",
    )
  },
}
