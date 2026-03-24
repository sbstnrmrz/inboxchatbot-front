/**
 * Tag query functions — pure async fetchers, no hooks, no UI.
 */

import { apiClient } from "@/lib/api/client"
import type { Tag } from "@/types/tag.type"

export interface ConversationTagsResponse {
  conversationId: string
  tags: string[]
}

export const tagsQueries = {
  list: (): Promise<Tag[]> =>
    apiClient.get<Tag[]>("/tags"),

  create: (data: { name: string; color?: string }): Promise<Tag> =>
    apiClient.post<Tag>("/tags", data),

  update: (id: string, data: { name?: string; color?: string }): Promise<Tag> =>
    apiClient.patch<Tag>(`/tags/${id}`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/tags/${id}`),

  addToConversation: (conversationId: string, tagId: string): Promise<ConversationTagsResponse> =>
    apiClient.post<ConversationTagsResponse>(`/conversations/${conversationId}/tags/${tagId}`),

  removeFromConversation: (conversationId: string, tagId: string): Promise<ConversationTagsResponse> =>
    apiClient.delete<ConversationTagsResponse>(`/conversations/${conversationId}/tags/${tagId}`),
}
