/**
 * Customer additional query functions — pure async fetchers, no hooks, no UI.
 *
 * Hits GET /customers/additional which returns customers with extra computed
 * fields (e.g. messageCount). Only import from hooks.
 */

import { apiClient } from "@/lib/api/client"
import type { Customer } from "@/types/customer.type"

export interface CustomerAdditionalDetails extends Customer {
  messageCount: number;
  conversationId: string;
}

export interface CustomersAdditionalParams {
  search?: string
}

export const customersAdditionalQueries = {
  list: (params?: CustomersAdditionalParams): Promise<CustomerAdditionalDetails[]> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    const query = searchParams.toString()
    return apiClient.get<CustomerAdditionalDetails[]>(
      query ? `/customers/additional?${query}` : "/customers/additional",
    )
  },
}
