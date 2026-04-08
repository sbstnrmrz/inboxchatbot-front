import { apiClient } from "@/lib/api/client"

export interface CustomerCountParams {
  date?: string
  from?: string
  to?: string
}

export interface CustomerCountResponse {
  count: number
}

export const customerStatsQueries = {
  count: (params?: CustomerCountParams): Promise<CustomerCountResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set("date", params.date)
    if (params?.from) searchParams.set("from", params.from)
    if (params?.to) searchParams.set("to", params.to)
    const query = searchParams.toString()
    return apiClient.get<CustomerCountResponse>(
      query ? `/customers/count?${query}` : `/customers/count`,
    )
  },
}
