/**
 * Message query functions — pure async fetchers, no hooks, no UI.
 *
 * Messages are scoped to a conversation: GET /conversations/:id/messages
 * Only import from hooks (useMessages).
 */

import { apiClient } from "@/lib/api/client"
import type { Message } from "@/types/message.type"

export interface MessagesListParams {
  /** Cursor: return messages sent before this ISO timestamp */
  before?: string
  limit?: number
}

export interface MessagesListResponse {
  data: Message[]
  /** Cursor for the next page — undefined when no more pages */
  nextCursor?: string
}

export const messagesQueries = {
  /**
   * Fetch a page of messages for a conversation, sorted by sentAt descending.
   * Pass `before` cursor for loading older messages (infinite scroll upward).
   */
  byConversation: (
    conversationId: string,
    params?: MessagesListParams,
  ): Promise<MessagesListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.before) searchParams.set("before", params.before)
    if (params?.limit) searchParams.set("limit", String(params.limit))
    const query = searchParams.toString()
    return apiClient.get<MessagesListResponse>(
      query
        ? `/conversations/${conversationId}/messages?${query}`
        : `/conversations/${conversationId}/messages`,
    )
  },
}
