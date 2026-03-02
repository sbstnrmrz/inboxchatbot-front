/**
 * useRequestAgentEvent — listens for the `request_agent` socket event.
 *
 * When the bot cannot resolve a conversation and needs a human agent, the
 * backend emits this event with the conversationId that requires attention.
 *
 * Patches `requestingAgent: true` in IndexedDB so the conversation list
 * surfaces the visual indicator immediately.
 */

import { useEffect } from "react"
import type { Socket } from "socket.io-client"
import { ConversationEvent } from "@/features/sockets/types/events"
import { patchConversation } from "@/lib/sync/conversations.sync"
import { logger } from "@/lib/logger"

interface UseRequestAgentEventOptions {
  socket: Socket | null
}

interface RequestAgentPayload {
  conversationId: string
}

export function useRequestAgentEvent({ socket }: UseRequestAgentEventOptions) {
  useEffect(() => {
    if (!socket) return

    const handleRequestAgent = async (data: RequestAgentPayload) => {
      logger.debug("[useRequestAgentEvent] request_agent", data)

      await patchConversation(data.conversationId, { requestingAgent: true }).catch(
        (err) => logger.error("[useRequestAgentEvent] failed to patch conversation", err),
      )
    }

    socket.on(ConversationEvent.RequestAgent, handleRequestAgent)

    return () => {
      socket.off(ConversationEvent.RequestAgent, handleRequestAgent)
    }
  }, [socket])
}
