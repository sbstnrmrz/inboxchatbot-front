/**
 * useLiveCustomer — reactive single-customer read from IndexedDB via Dexie.
 *
 * Re-renders automatically whenever the customers table entry changes.
 * Reads local cache only — the server sync is handled by useInitialSync.
 */

import { useLiveQuery } from "dexie-react-hooks"
import { customersRepository } from "@/lib/db/repositories/customers.repository"
import type { CachedCustomer } from "@/lib/db/schema"

export function useLiveCustomer(customerId: string | undefined): CachedCustomer | undefined {
  return useLiveQuery(
    () =>
      customerId
        ? customersRepository.getById(customerId)
        : Promise.resolve(undefined),
    [customerId],
  )
}
