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
  page?: number
  limit?: number
}

export interface CustomersAdditionalResponse {
  data: CustomerAdditionalDetails[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const customersAdditionalQueries = {
  list: (params?: CustomersAdditionalParams): Promise<CustomersAdditionalResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.limit) searchParams.set("limit", String(params.limit))
    const query = searchParams.toString()
    return apiClient.get<CustomersAdditionalResponse>(
      query ? `/customers/additional?${query}` : "/customers/additional",
    )
  },
}
