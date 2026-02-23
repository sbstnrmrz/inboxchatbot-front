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

export const customersAdditionalQueries = {
  list: (): Promise<CustomerAdditionalDetails[]> =>
    apiClient.get<CustomerAdditionalDetails[]>("/customers/additional"),
}
