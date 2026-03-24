/**
 * useTagEvents — listens for real-time tag socket events.
 *
 * Handles:
 *  - tag_created / tag_updated / tag_deleted: invalidates the tags query
 *  - conversation_tag_added / conversation_tag_removed: patches the conversation
 *    in IndexedDB with the updated tags array
 */

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { Socket } from "socket.io-client"
import { TagEvent } from "@/features/sockets/types/events"
import { queryKeys } from "@/lib/query-keys"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import type { Tag } from "@/types/tag.type"

interface UseTagEventsOptions {
  socket: Socket | null
}

export function useTagEvents({ socket }: UseTagEventsOptions) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    const handleTagCreated = (_data: Tag) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() })
    }

    const handleTagUpdated = (_data: Tag) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() })
    }

    const handleTagDeleted = (_data: { tagId: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() })
    }

    const handleConversationTagAdded = async (data: { conversationId: string; tags: string[] }) => {
      await conversationsRepository.patch(data.conversationId, { tags: data.tags })
    }

    const handleConversationTagRemoved = async (data: { conversationId: string; tags: string[] }) => {
      await conversationsRepository.patch(data.conversationId, { tags: data.tags })
    }

    socket.on(TagEvent.Created, handleTagCreated)
    socket.on(TagEvent.Updated, handleTagUpdated)
    socket.on(TagEvent.Deleted, handleTagDeleted)
    socket.on(TagEvent.ConversationTagAdded, handleConversationTagAdded)
    socket.on(TagEvent.ConversationTagRemoved, handleConversationTagRemoved)

    return () => {
      socket.off(TagEvent.Created, handleTagCreated)
      socket.off(TagEvent.Updated, handleTagUpdated)
      socket.off(TagEvent.Deleted, handleTagDeleted)
      socket.off(TagEvent.ConversationTagAdded, handleConversationTagAdded)
      socket.off(TagEvent.ConversationTagRemoved, handleConversationTagRemoved)
    }
  }, [socket, queryClient])
}
