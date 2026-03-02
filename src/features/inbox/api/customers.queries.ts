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

  /** Fetch a single customer by ID. */
  getById: (id: string): Promise<Customer> =>
    apiClient.get<Customer>(`/customers/${id}`),

  /** Block a customer. */
  block: (id: string): Promise<Customer> =>
    apiClient.patch<Customer>(`/customers/${id}/block`),

  /** Unblock a customer. */
  unblock: (id: string): Promise<Customer> =>
    apiClient.patch<Customer>(`/customers/${id}/unblock`),
}
