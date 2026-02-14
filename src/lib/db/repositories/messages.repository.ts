/**
 * Message repository — low-level IndexedDB operations for messages.
 *
 * Only import this from sync helpers or hooks, never from UI components.
 */

import Dexie from "dexie"
import { db } from "@/lib/db/database"
import type { CachedMessage } from "@/lib/db/schema"

export const messagesRepository = {
  /** Upsert a single message. */
  upsert(message: CachedMessage): Promise<string> {
    return db.messages.put(message)
  },

  /** Upsert many messages in a single transaction. */
  async upsertMany(messages: CachedMessage[]): Promise<void> {
    await db.transaction("rw", db.messages, () =>
      db.messages.bulkPut(messages),
    )
  },

  /** Get a single message by id. */
  getById(id: string): Promise<CachedMessage | undefined> {
    return db.messages.get(id)
  },

  /**
   * Get all messages for a conversation sorted by sentAt ascending
   * (oldest first — natural chat order).
   */
  getByConversation(conversationId: string): Promise<CachedMessage[]> {
    return db.messages
      .where("[conversationId+sentAt]")
      .between(
        [conversationId, Dexie.minKey],
        [conversationId, Dexie.maxKey],
        true,
        true,
      )
      .toArray()
  },

  /**
   * Get the N most recent messages for a conversation (descending).
   * Useful for initial chat window hydration without loading full history.
   */
  async getRecentByConversation(
    conversationId: string,
    limit: number = 50,
  ): Promise<CachedMessage[]> {
    const rows = await db.messages
      .where("[conversationId+sentAt]")
      .between(
        [conversationId, Dexie.minKey],
        [conversationId, Dexie.maxKey],
        true,
        true,
      )
      .reverse()
      .limit(limit)
      .toArray()

    // Restore chronological order for rendering
    return rows.reverse()
  },

  /**
   * Get messages older than a given sentAt timestamp for cursor-based pagination.
   */
  getPageBefore(
    conversationId: string,
    beforeSentAt: number,
    limit: number = 50,
  ): Promise<CachedMessage[]> {
    return db.messages
      .where("[conversationId+sentAt]")
      .between(
        [conversationId, Dexie.minKey],
        [conversationId, beforeSentAt],
        true,
        false, // exclude the cursor itself
      )
      .reverse()
      .limit(limit)
      .toArray()
      .then((rows) => rows.reverse())
  },

  /** Update status on a message (e.g. SENT → DELIVERED → READ). */
  async updateStatus(
    id: string,
    status: CachedMessage["status"],
    timestamps?: { deliveredAt?: number; readAt?: number },
  ): Promise<void> {
    await db.messages.update(id, { status, ...timestamps })
  },

  /** Delete a message by id. */
  delete(id: string): Promise<void> {
    return db.messages.delete(id)
  },

  /** Remove all cached messages for a conversation. */
  clearByConversation(conversationId: string): Promise<number> {
    return db.messages.where("conversationId").equals(conversationId).delete()
  },

  /** Remove all cached messages for a tenant (e.g. on sign-out). */
  clearByTenant(tenantId: string): Promise<number> {
    return db.messages.where("tenantId").equals(tenantId).delete()
  },
}


