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

export const messagesQueries = {
  /**
   * Fetch messages for a conversation. The API returns a plain Message[] array.
   * Pass `before` (ISO timestamp) for cursor-based pagination (older messages).
   */
  byConversation: (
    conversationId: string,
    params?: MessagesListParams,
  ): Promise<Message[]> => {
    const searchParams = new URLSearchParams()
    if (params?.before) searchParams.set("before", params.before)
    if (params?.limit) searchParams.set("limit", String(params.limit))
    const query = searchParams.toString()
    return apiClient.get<Message[]>(
      query
        ? `/conversations/${conversationId}/messages?${query}`
        : `/conversations/${conversationId}/messages`,
    )
  },
}
