/**
 * Draft repository — low-level IndexedDB operations for message drafts.
 *
 * A draft is keyed by `${tenantId}:${conversationId}` so there is always
 * at most one draft per conversation per tenant.
 *
 * Only import this from sync helpers or hooks, never from UI components.
 */

import { db } from "@/lib/db/database"
import type { CachedDraft } from "@/lib/db/schema"

export const draftsRepository = {
  /** Build the composite primary key used for drafts. */
  buildId(tenantId: string, conversationId: string): string {
    return `${tenantId}:${conversationId}`
  },

  /** Save or update a draft. */
  save(
    tenantId: string,
    conversationId: string,
    body: string,
  ): Promise<string> {
    const draft: CachedDraft = {
      id: draftsRepository.buildId(tenantId, conversationId),
      tenantId,
      conversationId,
      body,
      updatedAt: Date.now(),
    }
    return db.drafts.put(draft)
  },

  /** Get a draft for a specific conversation. */
  get(
    tenantId: string,
    conversationId: string,
  ): Promise<CachedDraft | undefined> {
    return db.drafts.get(draftsRepository.buildId(tenantId, conversationId))
  },

  /** Delete a draft after it has been sent. */
  delete(tenantId: string, conversationId: string): Promise<void> {
    return db.drafts.delete(draftsRepository.buildId(tenantId, conversationId))
  },

  /** Remove all drafts for a tenant (e.g. on sign-out). */
  clearByTenant(tenantId: string): Promise<number> {
    return db.drafts.where("tenantId").equals(tenantId).delete()
  },
}
