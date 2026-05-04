import { apiClient } from "@/lib/api/client"

export interface ConversationCountParams {
  date?: string
  from?: string
  to?: string
}

export interface ConversationCountResponse {
  total: number
  whatsapp?: number
  instagram?: number
}

export const conversationStatsQueries = {
  count: (params?: ConversationCountParams): Promise<ConversationCountResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set("date", params.date)
    if (params?.from) searchParams.set("from", params.from)
    if (params?.to) searchParams.set("to", params.to)
    const query = searchParams.toString()
    return apiClient.get<ConversationCountResponse>(
      query ? `/conversations/count?${query}` : `/conversations/count`,
    )
  },
}
