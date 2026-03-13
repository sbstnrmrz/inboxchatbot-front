/**
 * useInitialSync — orchestrates the initial data load when the user authenticates.
 *
 * Fires parallel queries for conversations and customers.
 * Each query independently syncs its data into IndexedDB on success.
 *
 * Also exposes `hasNextPage` / `fetchNextPage` from the conversations infinite
 * query so the chat list can trigger load-more on scroll.
 *
 * Usage: call once in InboxLayout (or any layout that requires authenticated data).
 * Pass `enabled: false` while the session is still loading to prevent premature requests.
 */

import { useConversations } from "@/features/inbox/hooks/useConversations"
import { useCustomers } from "@/features/inbox/hooks/useCustomers"

interface UseInitialSyncOptions {
  /** Pass false while the session is still loading to prevent premature requests */
  enabled: boolean
}

export function useInitialSync({ enabled }: UseInitialSyncOptions) {
  const conversations = useConversations({ enabled })
  const customers = useCustomers({ enabled })

  const isPending = conversations.isPending || customers.isPending
  const isError = conversations.isError || customers.isError
  const errors = [conversations.error, customers.error].filter(Boolean)

  return {
    isPending,
    isError,
    errors,
    /** True if there are more conversation pages to load */
    hasNextPage: conversations.hasNextPage,
    /** Fetches the next page of conversations (cursor-based) */
    fetchNextPage: conversations.fetchNextPage,
    /** True while a next-page fetch is in flight */
    isFetchingNextPage: conversations.isFetchingNextPage,
  }
}
