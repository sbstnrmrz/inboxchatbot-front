import Dexie, { type EntityTable } from "dexie"
import type {
  CachedConversation,
  CachedCustomer,
  CachedDraft,
  CachedMessage,
  SyncMeta,
} from "@/lib/db/schema"

/**
 * InboxDB — Dexie database for local caching and offline-first UX.
 *
 * Versioning rules:
 *  - Never modify an existing version block — always add a new `.version(n)`.
 *  - Bump version when adding tables, adding indexed columns, or renaming columns.
 *  - Non-indexed columns can be added without a version bump.
 *
 * Index syntax (Dexie):
 *  - `id`         → primary key (unique)
 *  - `[a+b]`      → compound index
 *  - `*field`     → multi-entry index (array values)
 *  - No `&` needed on PK — it is always unique by default.
 */
class InboxDB extends Dexie {
  customers!: EntityTable<CachedCustomer, "id">
  conversations!: EntityTable<CachedConversation, "id">
  messages!: EntityTable<CachedMessage, "id">
  drafts!: EntityTable<CachedDraft, "id">
  syncMeta!: EntityTable<SyncMeta, "id">

  constructor() {
    super("InboxDB")

    /**
     * v1 — initial schema
     *
     * customers:
     *   PK: id
     *   Indexes: tenantId, [tenantId+whatsappId], [tenantId+instagramAccountId]
     *
     * conversations:
     *   PK: id
     *   Indexes: tenantId, customerId, [tenantId+status], [tenantId+channel],
     *            [tenantId+lastMessageAt] (for sorted inbox list)
     *
     * messages:
     *   PK: id
     *   Indexes: conversationId, [conversationId+sentAt] (for paginated history),
     *            tenantId, externalId
     *
     * drafts:
     *   PK: id (= `${tenantId}:${conversationId}`)
     *   Indexes: tenantId, conversationId
     *
     * syncMeta:
     *   PK: id (= `${tenantId}:${entity}`)
     *   Indexes: tenantId
     */
    this.version(1).stores({
      customers: [
        "id",
        "tenantId",
        "[tenantId+whatsappId]",
        "[tenantId+instagramAccountId]",
      ].join(", "),

      conversations: [
        "id",
        "tenantId",
        "customerId",
        "[tenantId+status]",
        "[tenantId+channel]",
        "[tenantId+lastMessageAt]",
      ].join(", "),

      messages: [
        "id",
        "tenantId",
        "conversationId",
        "[conversationId+sentAt]",
        "externalId",
      ].join(", "),

      drafts: [
        "id",
        "tenantId",
        "conversationId",
      ].join(", "),

      syncMeta: [
        "id",
        "tenantId",
      ].join(", "),
    })
  }
}

/**
 * Singleton database instance.
 * Import this — never instantiate InboxDB directly in features.
 */
export const db = new InboxDB()
