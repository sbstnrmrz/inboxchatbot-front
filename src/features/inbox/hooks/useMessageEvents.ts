/**
 * useMessageEvents — listens for real-time message socket events and persists
 * them into IndexedDB.
 *
 * Handles:
 *  - message_received: incoming messages from other participants
 *  - message_sent: confirmation of messages sent by the current agent
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
import { syncConversation } from "@/lib/sync/conversations.sync"
import { syncCustomer } from "@/lib/sync/customers.sync"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import { customersRepository } from "@/lib/db/repositories/customers.repository"
import { conversationsQueries } from "@/features/inbox/api/conversations.queries"
import { customersQueries } from "@/features/inbox/api/customers.queries"
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

    const handleMessageReceived = async (data: Message) => {
      logger.debug("[useMessageEvents] message_received", data)

      // If the conversation isn't cached yet (new conversation arriving via
      // message_received before any conversation_created event), fetch it and
      // its customer so the inbox renders names instead of raw IDs.
      const cachedConversation = await conversationsRepository
        .getById(data.conversationId)
        .catch(() => undefined)

      if (!cachedConversation) {
        logger.debug("[useMessageEvents] conversation not cached, fetching", data.conversationId)
        const conversation = await conversationsQueries
          .getById(data.conversationId)
          .catch((err) => {
            logger.error("[useMessageEvents] failed to fetch conversation", err)
            return undefined
          })

        if (conversation) {
          // Cache customer BEFORE syncing the conversation so that when Dexie
          // reactivity fires the list item already has the customer name.
          const cachedCustomer = await customersRepository
            .getById(conversation.customerId)
            .catch(() => undefined)

          if (!cachedCustomer) {
            await customersQueries
              .getById(conversation.customerId)
              .then((customer) => syncCustomer(customer))
              .catch((err) => logger.error("[useMessageEvents] failed to fetch customer", err))
          }

          await syncConversation(conversation).catch(console.error)
        }
      }

      // Persist into IndexedDB — useLiveMessages will re-render automatically
      syncMessage(data).catch(console.error)

      // Invalidate conversations so inbox list refreshes lastMessageAt/unreadCount
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
    }

    const handleMessageSent = (data: Message) => {
      logger.debug("[useMessageEvents] message_sent", data)

      // Persist the sent message confirmation into IndexedDB
      syncMessage(data).catch(console.error)

      // Invalidate conversations so inbox list reflects the latest outbound message
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
    }

    socket.on(MessageEvent.Received, handleMessageReceived)
    socket.on(MessageEvent.Sent, handleMessageSent)

    return () => {
      socket.off(MessageEvent.Received, handleMessageReceived)
      socket.off(MessageEvent.Sent, handleMessageSent)
    }
  }, [socket, queryClient])
}
