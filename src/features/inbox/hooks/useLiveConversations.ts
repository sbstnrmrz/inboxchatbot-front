/**
 * useLiveConversations — reactive read from IndexedDB via Dexie's useLiveQuery.
 *
 * Re-renders automatically whenever the conversations table changes
 * (e.g. after useInitialSync writes data or a socket event patches a row).
 *
 * This is the hook UI components should use to render the conversation list.
 * It does NOT fetch from the server — that is handled by useConversations/useInitialSync.
 */

import { useLiveQuery } from "dexie-react-hooks"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import { useAuth } from "@/features/auth/context"
import type { CachedConversation } from "@/lib/db/schema"

export function useLiveConversations(): CachedConversation[] {
  const { session } = useAuth()
  const tenantId = (session?.user as any)?.tenantId as string | undefined

  return (
    useLiveQuery(
      () =>
        tenantId
          ? conversationsRepository.getAllByTenant(tenantId)
          : Promise.resolve([]),
      [tenantId],
    ) ?? []
  )
}
