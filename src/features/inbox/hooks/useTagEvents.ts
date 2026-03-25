/**
 * useTagEvents — listens for real-time tag socket events.
 *
 * Handles:
 *  - tag_created / tag_updated / tag_deleted: updates the tags query cache directly
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

    const handleTagCreated = (data: Tag) => {
      queryClient.setQueryData<Tag[]>(queryKeys.tags.all(), (prev) =>
        prev ? [...prev, data] : [data],
      )
    }

    const handleTagUpdated = (data: Tag) => {
      queryClient.setQueryData<Tag[]>(queryKeys.tags.all(), (prev) =>
        prev?.map((t) => (t._id === data._id ? data : t)),
      )
    }

    const handleTagDeleted = (data: { tagId: string }) => {
      queryClient.setQueryData<Tag[]>(queryKeys.tags.all(), (prev) =>
        prev?.filter((t) => t._id !== data.tagId),
      )
    }

    const handleConversationTagAdded = async (data: { conversationId: string; tags: string[] }) => {
      await conversationsRepository.patch(data.conversationId, { tags: data.tags })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() })
    }

    const handleConversationTagRemoved = async (data: { conversationId: string; tags: string[] }) => {
      await conversationsRepository.patch(data.conversationId, { tags: data.tags })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() })
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
