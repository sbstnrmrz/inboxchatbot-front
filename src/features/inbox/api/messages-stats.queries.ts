import { apiClient } from "@/lib/api/client"

export interface MessageCountParams {
  date?: string
  from?: string
  to?: string
}

export interface MessageCountResponse {
  count: number
}

export const messageStatsQueries = {
  count: (params?: MessageCountParams): Promise<MessageCountResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set("date", params.date)
    if (params?.from) searchParams.set("from", params.from)
    if (params?.to) searchParams.set("to", params.to)
    const query = searchParams.toString()
    return apiClient.get<MessageCountResponse>(
      query ? `/messages/count?${query}` : `/messages/count`,
    )
  },
}
