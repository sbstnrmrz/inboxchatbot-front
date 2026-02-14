/**
 * DB lifecycle helpers — tenant isolation and cache invalidation.
 *
 * Call `clearTenantCache` on sign-out to prevent data leakage between sessions.
 * Call `clearAllCache` if the database is corrupted or needs full reset.
 */

import { db } from "@/lib/db/database"

/**
 * Remove all locally cached data for a specific tenant.
 * Must be called on sign-out or tenant switch.
 */
export async function clearTenantCache(tenantId: string): Promise<void> {
  await db.transaction(
    "rw",
    [db.customers, db.conversations, db.messages, db.drafts, db.syncMeta],
    async () => {
      await Promise.all([
        db.customers.where("tenantId").equals(tenantId).delete(),
        db.conversations.where("tenantId").equals(tenantId).delete(),
        db.messages.where("tenantId").equals(tenantId).delete(),
        db.drafts.where("tenantId").equals(tenantId).delete(),
        db.syncMeta.where("tenantId").equals(tenantId).delete(),
      ])
    },
  )
}

/**
 * Wipe the entire local database.
 * Use only as a last resort (e.g. corrupted schema, forced reset).
 */
export async function clearAllCache(): Promise<void> {
  await db.transaction(
    "rw",
    [db.customers, db.conversations, db.messages, db.drafts, db.syncMeta],
    async () => {
      await Promise.all([
        db.customers.clear(),
        db.conversations.clear(),
        db.messages.clear(),
        db.drafts.clear(),
        db.syncMeta.clear(),
      ])
    },
  )
}
