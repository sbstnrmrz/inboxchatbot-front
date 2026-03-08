/**
 * useDismissAgentEvent — listens for the `dismiss_agent` socket event.
 *
 * When an agent request is dismissed (either by the agent via the UI or
 * triggered by the backend), this event clears `requestingAgent` in
 * IndexedDB so the conversation list removes the visual indicator immediately.
 */

import { useEffect } from "react"
import type { Socket } from "socket.io-client"
import { ConversationEvent } from "@/features/sockets/types/events"
import { patchConversation } from "@/lib/sync/conversations.sync"
import { logger } from "@/lib/logger"

interface UseDismissAgentEventOptions {
  socket: Socket | null
}

interface DismissAgentPayload {
  conversationId: string
}

export function useDismissAgentEvent({ socket }: UseDismissAgentEventOptions) {
  useEffect(() => {
    if (!socket) return

    const handleDismissAgent = async (data: DismissAgentPayload) => {
      logger.debug("[useDismissAgentEvent] dismiss_agent", data)

      await patchConversation(data.conversationId, { requestingAgent: false }).catch(
        (err) => logger.error("[useDismissAgentEvent] failed to patch conversation", err),
      )
    }

    socket.on(ConversationEvent.DismissAgent, handleDismissAgent)

    return () => {
      socket.off(ConversationEvent.DismissAgent, handleDismissAgent)
    }
  }, [socket])
}
