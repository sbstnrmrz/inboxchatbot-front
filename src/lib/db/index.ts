/**
 * Public API for the local persistence layer.
 *
 * Features import from here — never from internal sub-paths.
 */

// Database instance (use only in repositories and sync helpers)
export { db } from "@/lib/db/database"

// Cached entity types
export type {
  CachedCustomer,
  CachedConversation,
  CachedMessage,
  CachedDraft,
  SyncMeta,
} from "@/lib/db/schema"

// Repositories
export { customersRepository } from "@/lib/db/repositories/customers.repository"
export { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
export { messagesRepository } from "@/lib/db/repositories/messages.repository"
export { draftsRepository } from "@/lib/db/repositories/drafts.repository"
