/**
 * Customer repository — low-level IndexedDB operations for customers.
 *
 * Only import this from sync helpers or hooks, never from UI components.
 */

import { db } from "@/lib/db/database"
import type { CachedCustomer } from "@/lib/db/schema"

export const customersRepository = {
  /** Upsert a single customer (add or replace by id). */
  upsert(customer: CachedCustomer): Promise<string> {
    return db.customers.put(customer)
  },

  /** Upsert many customers in a single transaction. */
  async upsertMany(customers: CachedCustomer[]): Promise<void> {
    await db.transaction("rw", db.customers, () =>
      db.customers.bulkPut(customers),
    )
  },

  /** Get a customer by id. */
  getById(id: string): Promise<CachedCustomer | undefined> {
    return db.customers.get(id)
  },

  /** Get all customers for a tenant. */
  getAllByTenant(tenantId: string): Promise<CachedCustomer[]> {
    return db.customers.where("tenantId").equals(tenantId).toArray()
  },

  /** Lookup by WhatsApp contact id within a tenant. */
  getByWhatsAppId(
    tenantId: string,
    whatsappId: string,
  ): Promise<CachedCustomer | undefined> {
    return db.customers
      .where("[tenantId+whatsappId]")
      .equals([tenantId, whatsappId])
      .first()
  },

  /** Lookup by Instagram account id within a tenant. */
  getByInstagramAccountId(
    tenantId: string,
    instagramAccountId: string,
  ): Promise<CachedCustomer | undefined> {
    return db.customers
      .where("[tenantId+instagramAccountId]")
      .equals([tenantId, instagramAccountId])
      .first()
  },

  /** Delete a customer by id. */
  delete(id: string): Promise<void> {
    return db.customers.delete(id)
  },

  /** Remove all cached customers for a tenant (e.g. on sign-out). */
  clearByTenant(tenantId: string): Promise<number> {
    return db.customers.where("tenantId").equals(tenantId).delete()
  },
}
