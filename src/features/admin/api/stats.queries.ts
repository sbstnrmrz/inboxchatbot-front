import { apiClient } from "@/lib/api/client"
import type { MessageCountResponse } from "@/features/inbox/api/messages-stats.queries"
import type { CustomerCountResponse } from "@/features/inbox/api/customers-stats.queries"
import type { LlmUsageTotals } from "@/features/inbox/api/llm-usage.queries"
import type { BookingCountResponse } from "@/features/inbox/api/bookings-stats.queries"

interface DateParams {
  date?: string
  from?: string
  to?: string
}

function buildDateQuery(params?: DateParams): string {
  const searchParams = new URLSearchParams()
  if (params?.date) searchParams.set("date", params.date)
  if (params?.from) searchParams.set("from", params.from)
  if (params?.to) searchParams.set("to", params.to)
  return searchParams.toString()
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

  bookingCount: (tenantId: string, params?: DateParams): Promise<BookingCountResponse> => {
    const query = buildDateQuery(params)
    return apiClient.get<BookingCountResponse>(
      query ? `/bookings/count/${tenantId}?${query}` : `/bookings/count/${tenantId}`,
    )
  },

  bookingCreatedCount: (tenantId: string, params?: DateParams): Promise<BookingCountResponse> => {
    const query = buildDateQuery(params)
    return apiClient.get<BookingCountResponse>(
      query ? `/bookings/count/created/${tenantId}?${query}` : `/bookings/count/created/${tenantId}`,
    )
  },
}
