/**
 * Customer sync helpers — bridge between TanStack Query and IndexedDB.
 *
 * Call these from `onSuccess` in TanStack Query hooks.
 * Never call them from UI components directly.
 */

import { customersRepository } from "@/lib/db/repositories/customers.repository"
import { mapCustomerToCache, mapCustomersToCache } from "@/lib/sync/mappers"
import type { Customer } from "@/types/customer.type"

/**
 * Persist a list of customers returned by the API into IndexedDB.
 */
export async function syncCustomers(customers: Customer[]): Promise<void> {
  if (customers.length === 0) return
  const cached = mapCustomersToCache(customers)
  await customersRepository.upsertMany(cached)
}

/**
 * Persist a single customer.
 */
export async function syncCustomer(customer: Customer): Promise<void> {
  const cached = mapCustomerToCache(customer)
  await customersRepository.upsert(cached)
}

/**
 * Remove a customer from the local cache.
 */
export async function removeCustomer(id: string): Promise<void> {
  await customersRepository.delete(id)
}
