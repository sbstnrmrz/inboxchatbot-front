/**
 * useConversationReadEvent — manages the conversation_read socket event.
 *
 * Responsibilities:
 *  1. EMIT: when `conversationId` changes (a conversation is selected), emit
 *     `conversation_read` to the server and optimistically zero out the local
 *     unreadCount in IndexedDB so the badge disappears immediately.
 *
 *  2. LISTEN: when the server re-broadcasts `conversation_read` (from any
 *     client in the same room), patch the local IndexedDB cache for that
 *     conversation so all open tabs/agents stay in sync.
 */

import { useEffect, useRef } from "react"
import { Socket } from "socket.io-client"
import { ConversationEvent } from "@/features/sockets/types/events"
import { patchConversation } from "@/lib/sync/conversations.sync"
import { logger } from "@/lib/logger"

interface ConversationReadPayload {
  conversationId: string
}

interface UseConversationReadEventOptions {
  socket: Socket | null
  conversationId: string | null
}

export function useConversationReadEvent({
  socket,
  conversationId,
}: UseConversationReadEventOptions) {
  // Track the previous conversationId to avoid double-emitting on re-renders
  const lastEmittedId = useRef<string | null>(null)

  // ── 1. EMIT when the selected conversation changes ──────────────────────
  useEffect(() => {
    if (!socket || !conversationId) return
    if (lastEmittedId.current === conversationId) return

    lastEmittedId.current = conversationId

    logger.debug("[useConversationReadEvent] emitting conversation_read", {
      conversationId,
    })

    socket.emit(ConversationEvent.Read, { conversationId })

    // Optimistic local update — zero out unreadCount instantly so the badge
    // disappears before the server round-trip completes.
    patchConversation(conversationId, { unreadCount: 0 }).catch(console.error)
  }, [socket, conversationId])

  // ── 2. LISTEN for the server re-broadcast ────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const handleConversationRead = (data: ConversationReadPayload) => {
      logger.debug("[useConversationReadEvent] received conversation_read", data)

      patchConversation(data.conversationId, { unreadCount: 0 }).catch(
        console.error,
      )
    }

    socket.on(ConversationEvent.Read, handleConversationRead)

    return () => {
      socket.off(ConversationEvent.Read, handleConversationRead)
    }
  }, [socket])
}
