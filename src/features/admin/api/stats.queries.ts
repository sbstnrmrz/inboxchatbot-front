import { apiClient } from "@/lib/api/client"
import type { MessageCountResponse } from "@/features/inbox/api/messages-stats.queries"
import type { CustomerCountResponse } from "@/features/inbox/api/customers-stats.queries"
import type { LlmUsageTotals } from "@/features/inbox/api/llm-usage.queries"

interface DateParams {
  date?: string
  from?: string
  to?: string
}

export const adminStatsQueries = {
  messageCount: (tenantId: string, params?: DateParams): Promise<MessageCountResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set("date", params.date)
    if (params?.from) searchParams.set("from", params.from)
    if (params?.to) searchParams.set("to", params.to)
    const query = searchParams.toString()
    return apiClient.get<MessageCountResponse>(
      query
        ? `/messages/count/${tenantId}?${query}`
        : `/messages/count/${tenantId}`,
    )
  },

  customerCount: (tenantId: string, params?: DateParams): Promise<CustomerCountResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set("date", params.date)
    if (params?.from) searchParams.set("from", params.from)
    if (params?.to) searchParams.set("to", params.to)
    const query = searchParams.toString()
    return apiClient.get<CustomerCountResponse>(
      query
        ? `/customers/count/${tenantId}?${query}`
        : `/customers/count/${tenantId}`,
    )
  },

  llmUsage: (tenantId: string, params?: DateParams): Promise<LlmUsageTotals> => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set("date", params.date)
    if (params?.from) searchParams.set("from", params.from)
    if (params?.to) searchParams.set("to", params.to)
    const query = searchParams.toString()
    return apiClient.get<LlmUsageTotals>(
      query
        ? `/llm-usage/totals/${tenantId}?${query}`
        : `/llm-usage/totals/${tenantId}`,
    )
  },
}
