/**
 * Public API for the sync layer (server <-> IndexedDB).
 *
 * Call these from TanStack Query hooks (onSuccess) or socket handlers.
 * Never call them from UI components directly.
 */

export {
  syncCustomer,
  syncCustomers,
  removeCustomer,
} from "@/lib/sync/customers.sync"

export {
  syncConversation,
  syncConversations,
  removeConversation,
  patchConversation,
} from "@/lib/sync/conversations.sync"

export {
  syncMessage,
  syncMessages,
  updateMessageStatus,
  clearConversationMessages,
} from "@/lib/sync/messages.sync"

export {
  clearTenantCache,
  clearAllCache,
} from "@/lib/sync/db-lifecycle"

export {
  mapCustomerToCache,
  mapCustomersToCache,
  mapConversationToCache,
  mapConversationsToCache,
  mapMessageToCache,
  mapMessagesToCache,
} from "@/lib/sync/mappers"
