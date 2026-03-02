/**
 * useBlockCustomer — mutations to block/unblock a customer.
 *
 * On success, syncs the updated customer returned by the API into IndexedDB
 * so useLiveCustomer re-renders immediately with the new isBlocked value.
 */

import { useMutation } from "@tanstack/react-query"
import { customersQueries } from "@/features/inbox/api/customers.queries"
import { syncCustomer } from "@/lib/sync/customers.sync"

export function useBlockCustomer() {
  const block = useMutation({
    mutationFn: (customerId: string) => customersQueries.block(customerId),
    onSuccess: (customer) => syncCustomer(customer).catch(console.error),
  })

  const unblock = useMutation({
    mutationFn: (customerId: string) => customersQueries.unblock(customerId),
    onSuccess: (customer) => syncCustomer(customer).catch(console.error),
  })

  return { block, unblock }
}
