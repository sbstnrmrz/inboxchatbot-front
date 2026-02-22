/**
 * Customer additional query functions — pure async fetchers, no hooks, no UI.
 *
 * Hits GET /customers/additional which returns customers with extra computed
 * fields (e.g. messageCount). Only import from hooks.
 */

import { apiClient } from "@/lib/api/client"
import type { Customer } from "@/types/customer.type"

export interface CustomerWithCount extends Customer {
  messageCount: number
}

export const customersAdditionalQueries = {
  list: (): Promise<CustomerWithCount[]> =>
    apiClient.get<CustomerWithCount[]>("/customers/additional"),
}
