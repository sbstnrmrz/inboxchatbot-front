/**
 * useMessageEvents — listens for real-time message socket events and persists
 * them into IndexedDB.
 *
 * Because useLiveMessages reads IndexedDB reactively, writing here is enough
 * to trigger an automatic re-render in the chat view — no manual state updates
 * or query invalidations needed for the message list.
 *
 * Additionally invalidates the conversations query so the inbox list reflects
 * the updated lastMessageAt / unreadCount from the server on next refetch.
 */

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Socket } from "socket.io-client"
import { MessageEvent } from "@/features/sockets/types/events"
import { syncMessage } from "@/lib/sync"
import { queryKeys } from "@/lib/query-keys"
import { logger } from "@/lib/logger"
import type { Message } from "@/types/message.type"

interface UseMessageEventsOptions {
  socket: Socket | null
}

export function useMessageEvents({ socket }: UseMessageEventsOptions) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    const handleMessageReceived = (data: Message) => {
      logger.debug("[useMessageEvents] message_received", data)

      // Persist into IndexedDB — useLiveMessages will re-render automatically
      syncMessage(data).catch(console.error)

      // Invalidate conversations so inbox list refreshes lastMessageAt/unreadCount
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
    }

    socket.on(MessageEvent.Received, handleMessageReceived)

    return () => {
      socket.off(MessageEvent.Received, handleMessageReceived)
    }
  }, [socket, queryClient])
}
