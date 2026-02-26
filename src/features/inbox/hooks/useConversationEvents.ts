/**
 * useConversationEvents — listens for real-time conversation socket events and
 * persists them into IndexedDB.
 *
 * Handles:
 *  - conversation_created: new conversation arrived → sync conversation + fetch
 *    and cache the customer if not already in IndexedDB.
 *  - conversation_updated: existing conversation changed → patch IndexedDB row.
 *  - conversation_deleted: conversation removed → delete from IndexedDB.
 */

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { Socket } from "socket.io-client"
import { SocketEvents } from "@/features/sockets/types/events"
import { syncConversation, patchConversation, removeConversation } from "@/lib/sync/conversations.sync"
import { syncCustomer } from "@/lib/sync/customers.sync"
import { customersRepository } from "@/lib/db/repositories/customers.repository"
import { customersQueries } from "@/features/inbox/api/customers.queries"
import { queryKeys } from "@/lib/query-keys"
import { logger } from "@/lib/logger"
import type { Conversation } from "@/types/conversation.type"

interface UseConversationEventsOptions {
  socket: Socket | null
}

export function useConversationEvents({ socket }: UseConversationEventsOptions) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    const handleConversationCreated = async (data: Conversation) => {
      logger.debug("[useConversationEvents] conversation_created", data)

      // Sync conversation into IndexedDB
      await syncConversation(data).catch(console.error)

      // Fetch the customer if not already cached
      const cached = await customersRepository.getById(data.customerId).catch(() => undefined)
      if (!cached) {
        customersQueries
          .getById(data.customerId)
          .then((customer) => syncCustomer(customer))
          .catch((err) => logger.error("[useConversationEvents] failed to fetch customer", err))
      }

      // Refresh conversations query so TanStack Query cache stays in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
    }

    const handleConversationUpdated = async (data: Conversation) => {
      logger.debug("[useConversationEvents] conversation_updated", data)
      await syncConversation(data).catch(console.error)
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
    }

    const handleConversationDeleted = async (data: { _id: string }) => {
      logger.debug("[useConversationEvents] conversation_deleted", data)
      await removeConversation(data._id).catch(console.error)
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
    }

    socket.on(SocketEvents.ConversationCreated, handleConversationCreated)
    socket.on(SocketEvents.ConversationUpdated, handleConversationUpdated)
    socket.on(SocketEvents.ConversationDeleted, handleConversationDeleted)

    return () => {
      socket.off(SocketEvents.ConversationCreated, handleConversationCreated)
      socket.off(SocketEvents.ConversationUpdated, handleConversationUpdated)
      socket.off(SocketEvents.ConversationDeleted, handleConversationDeleted)
    }
  }, [socket, queryClient])
}
