import { apiClient } from "@/lib/api/client"

export interface ChannelUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  calls: number
}

export interface LlmUsageTotals {
  openai?: Partial<Record<string, ChannelUsage>>
  gemini?: Partial<Record<string, ChannelUsage>>
}

export interface LlmUsageParams {
  date?: string
  from?: string
  to?: string
}

export const llmUsageQueries = {
  totals: (params?: LlmUsageParams): Promise<LlmUsageTotals> => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set("date", params.date)
    if (params?.from) searchParams.set("from", params.from)
    if (params?.to) searchParams.set("to", params.to)
    const query = searchParams.toString()
    return apiClient.get<LlmUsageTotals>(query ? `/llm-usage/totals?${query}` : "/llm-usage/totals")
  },
}
