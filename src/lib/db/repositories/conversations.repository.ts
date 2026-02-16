/**
 * Conversation repository — low-level IndexedDB operations for conversations.
 *
 * Only import this from sync helpers or hooks, never from UI components.
 */

import { db } from "@/lib/db/database"
import type { CachedConversation } from "@/lib/db/schema"
import type { ConversationChannel, ConversationStatus } from "@/types/conversation.type"

export const conversationsRepository = {
  /** Upsert a single conversation. */
  upsert(conversation: CachedConversation): Promise<string> {
    return db.conversations.put(conversation)
  },

  /** Upsert many conversations in a single transaction. */
  async upsertMany(conversations: CachedConversation[]): Promise<void> {
    await db.transaction("rw", db.conversations, () =>
      db.conversations.bulkPut(conversations),
    )
  },

  /** Get a single conversation by id. */
  getById(id: string): Promise<CachedConversation | undefined> {
    return db.conversations.get(id)
  },

  /**
   * Get all conversations for a tenant sorted by lastMessageAt descending
   * (most recent first — inbox order).
   */
  async getAllByTenant(tenantId: string): Promise<CachedConversation[]> {
    const rows = await db.conversations
      .toArray()

    return rows.sort(
      (a, b) => (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
    )
  },

  /**
   * Get conversations filtered by status, sorted by lastMessageAt desc.
   */
  async getByStatus(
    tenantId: string,
    status: ConversationStatus,
  ): Promise<CachedConversation[]> {
    const rows = await db.conversations
      .where("[tenantId+status]")
      .equals([tenantId, status])
      .toArray()

    return rows.sort(
      (a, b) => (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
    )
  },

  /**
   * Get conversations filtered by channel, sorted by lastMessageAt desc.
   */
  async getByChannel(
    tenantId: string,
    channel: ConversationChannel,
  ): Promise<CachedConversation[]> {
    const rows = await db.conversations
      .where("[tenantId+channel]")
      .equals([tenantId, channel])
      .toArray()

    return rows.sort(
      (a, b) => (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
    )
  },

  /** Update specific fields on a conversation (partial update). */
  async patch(
    id: string,
    changes: Partial<Omit<CachedConversation, "id">>,
  ): Promise<void> {
    await db.conversations.update(id, changes)
  },

  /** Delete a conversation by id. */
  delete(id: string): Promise<void> {
    return db.conversations.delete(id)
  },

  /** Remove all cached conversations for a tenant (e.g. on sign-out). */
  clearByTenant(tenantId: string): Promise<number> {
    return db.conversations.where("tenantId").equals(tenantId).delete()
  },
}
