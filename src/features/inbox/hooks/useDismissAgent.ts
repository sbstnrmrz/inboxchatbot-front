/**
 * useDismissAgent — mutation to dismiss the agent request on a conversation.
 *
 * Calls PATCH /conversations/:id/dismiss-agent and patches `requestingAgent: false`
 * in IndexedDB so the conversation list clears the indicator immediately.
 */

import { useMutation } from "@tanstack/react-query"
import { conversationsQueries } from "@/features/inbox/api/conversations.queries"
import { patchConversation } from "@/lib/sync/conversations.sync"
import { logger } from "@/lib/logger"

export function useDismissAgent(conversationId: string) {
  return useMutation({
    mutationFn: () => conversationsQueries.dismissAgent(conversationId),
    onSuccess: () => {
      patchConversation(conversationId, { requestingAgent: false }).catch((err) =>
        logger.error("[useDismissAgent] failed to patch conversation", err),
      )
    },
  })
}
