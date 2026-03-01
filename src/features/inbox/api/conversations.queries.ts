/**
 * Conversation query functions — pure async fetchers, no hooks, no UI.
 *
 * Only import from hooks (useConversations, useInitialSync).
 */

import { apiClient } from "@/lib/api/client"
import type { Conversation } from "@/types/conversation.type"

export interface ToggleBotResponse {
  botEnabled: boolean
  botDisabledAt?: string
}

export interface ConversationsListParams {
  /** Cursor: return conversations with lastMessageAt before this ISO timestamp */
  before?: string
  limit?: number
}

export const conversationsQueries = {
  /**
   * Fetch a page of conversations sorted by lastMessageAt descending.
   * Pass `before` cursor for subsequent pages.
   */
  list: (params?: ConversationsListParams): Promise<Conversation[]> => {
    const searchParams = new URLSearchParams()
    if (params?.before) searchParams.set("before", params.before)
    if (params?.limit) searchParams.set("limit", String(params.limit))
    const query = searchParams.toString()
    return apiClient.get<Conversation[]>(
      query ? `/conversations?${query}` : "/conversations",
    )
  },

  /** Fetch a single conversation by ID. */
  getById: (id: string): Promise<Conversation> =>
    apiClient.get<Conversation>(`/conversations/${id}`),

  /**
   * Toggle the bot on/off for a conversation.
   * Returns { botEnabled, botDisabledAt } — not the full conversation.
   */
  toggleBot: (conversationId: string): Promise<ToggleBotResponse> =>
    apiClient.patch<ToggleBotResponse>(`/conversations/${conversationId}/toggle-bot`),
}
