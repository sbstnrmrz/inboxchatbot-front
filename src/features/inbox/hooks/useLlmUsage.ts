import { useQueries, useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { llmUsageQueries } from "@/features/inbox/api/llm-usage.queries"
import type { LlmUsageTotals } from "@/features/inbox/api/llm-usage.queries"

export function useLlmUsageTotals() {
  return useQuery({
    queryKey: queryKeys.llmUsage.totals(),
    queryFn: () => llmUsageQueries.totals(),
  })
}

/** Returns YYYY-MM-DD in local time, not UTC */
function toLocalISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function getFirstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function useLlmUsageToday() {
  const today = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.llmUsage.totals({ date: today }),
    queryFn: () => llmUsageQueries.totals({ date: today }),
  })
}

export function useLlmUsageThisWeek() {
  const from = toLocalISO(getMonday(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.llmUsage.totals({ from, to }),
    queryFn: () => llmUsageQueries.totals({ from, to }),
  })
}

export function useLlmUsageThisMonth() {
  const from = toLocalISO(getFirstOfMonth(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.llmUsage.totals({ from, to }),
    queryFn: () => llmUsageQueries.totals({ from, to }),
  })
}

function getDatesInRange(from: Date, to: Date): string[] {
  const dates: string[] = []
  const current = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  while (current <= end) {
    dates.push(toLocalISO(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function sumChannelTokens(channels?: LlmUsageTotals[keyof LlmUsageTotals]): number {
  if (!channels) return 0
  return Object.values(channels).reduce((sum, ch) => sum + (ch?.totalTokens ?? 0), 0)
}

export interface DailyLlmUsage {
  date: string
  openai: number
  gemini: number
}

export function useLlmUsageByRange(from: Date, to: Date) {
  const dates = getDatesInRange(from, to)

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: queryKeys.llmUsage.totals({ date }),
      queryFn: async () => {
        const res = await llmUsageQueries.totals({ date })
        console.log(`[llm-usage] ${date}`, res)
        return res
      },
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const data: DailyLlmUsage[] = dates.map((date, i) => ({
    date,
    openai: sumChannelTokens(results[i].data?.openai),
    gemini: sumChannelTokens(results[i].data?.gemini),
  }))

  return { data, isLoading, isError }
}
