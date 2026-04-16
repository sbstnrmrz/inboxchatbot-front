import { useQueries, useQuery } from "@tanstack/react-query"
import { adminStatsQueryKeys } from "@/features/admin/api/stats.query-keys"
import { adminStatsQueries } from "@/features/admin/api/stats.queries"
import type { LlmUsageTotals } from "@/features/inbox/api/llm-usage.queries"

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

// ─── Message count hooks ──────────────────────────────────────────────────────

export function useAdminMessageCountToday(tenantId: string | null) {
  const today = toLocalISO(new Date())
  return useQuery({
    queryKey: adminStatsQueryKeys.messageCount({ tenantId: tenantId ?? "", date: today }),
    queryFn: () => adminStatsQueries.messageCount(tenantId!, { date: today }),
    enabled: tenantId !== null,
  })
}

export function useAdminMessageCountThisWeek(tenantId: string | null) {
  const from = toLocalISO(getMonday(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: adminStatsQueryKeys.messageCount({ tenantId: tenantId ?? "", from, to }),
    queryFn: () => adminStatsQueries.messageCount(tenantId!, { from, to }),
    enabled: tenantId !== null,
  })
}

export function useAdminMessageCountThisMonth(tenantId: string | null) {
  const from = toLocalISO(getFirstOfMonth(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: adminStatsQueryKeys.messageCount({ tenantId: tenantId ?? "", from, to }),
    queryFn: () => adminStatsQueries.messageCount(tenantId!, { from, to }),
    enabled: tenantId !== null,
  })
}

export interface DailyMessageCount {
  date: string
  total: number
  whatsapp: number
  instagram: number
}

export function useAdminMessageCountByRange(tenantId: string | null, from: Date, to: Date) {
  const dates = tenantId ? getDatesInRange(from, to) : []

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: adminStatsQueryKeys.messageCount({ tenantId: tenantId!, date }),
      queryFn: () => adminStatsQueries.messageCount(tenantId!, { date }),
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const data: DailyMessageCount[] = dates.map((date, i) => ({
    date,
    total: results[i].data?.total ?? 0,
    whatsapp: results[i].data?.whatsapp ?? 0,
    instagram: results[i].data?.instagram ?? 0,
  }))

  return { data, isLoading, isError }
}

// ─── Customer count hooks ─────────────────────────────────────────────────────

export function useAdminCustomerCountToday(tenantId: string | null) {
  const today = toLocalISO(new Date())
  return useQuery({
    queryKey: adminStatsQueryKeys.customerCount({ tenantId: tenantId ?? "", date: today }),
    queryFn: () => adminStatsQueries.customerCount(tenantId!, { date: today }),
    enabled: tenantId !== null,
  })
}

export function useAdminCustomerCountThisWeek(tenantId: string | null) {
  const from = toLocalISO(getMonday(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: adminStatsQueryKeys.customerCount({ tenantId: tenantId ?? "", from, to }),
    queryFn: () => adminStatsQueries.customerCount(tenantId!, { from, to }),
    enabled: tenantId !== null,
  })
}

export function useAdminCustomerCountThisMonth(tenantId: string | null) {
  const from = toLocalISO(getFirstOfMonth(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: adminStatsQueryKeys.customerCount({ tenantId: tenantId ?? "", from, to }),
    queryFn: () => adminStatsQueries.customerCount(tenantId!, { from, to }),
    enabled: tenantId !== null,
  })
}

export interface DailyCustomerCount {
  date: string
  total: number
  whatsapp: number
  instagram: number
}

export function useAdminCustomerCountByRange(tenantId: string | null, from: Date, to: Date) {
  const dates = tenantId ? getDatesInRange(from, to) : []

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: adminStatsQueryKeys.customerCount({ tenantId: tenantId!, date }),
      queryFn: () => adminStatsQueries.customerCount(tenantId!, { date }),
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const data: DailyCustomerCount[] = dates.map((date, i) => ({
    date,
    total: results[i].data?.total ?? 0,
    whatsapp: results[i].data?.whatsapp ?? 0,
    instagram: results[i].data?.instagram ?? 0,
  }))

  return { data, isLoading, isError }
}

// ─── LLM usage hooks ──────────────────────────────────────────────────────────

export function useAdminLlmUsageTotals(tenantId: string | null) {
  return useQuery({
    queryKey: adminStatsQueryKeys.llmUsage({ tenantId: tenantId ?? "" }),
    queryFn: () => adminStatsQueries.llmUsage(tenantId!),
    enabled: tenantId !== null,
  })
}

export function useAdminLlmUsageToday(tenantId: string | null) {
  const today = toLocalISO(new Date())
  return useQuery({
    queryKey: adminStatsQueryKeys.llmUsage({ tenantId: tenantId ?? "", date: today }),
    queryFn: () => adminStatsQueries.llmUsage(tenantId!, { date: today }),
    enabled: tenantId !== null,
  })
}

export function useAdminLlmUsageThisWeek(tenantId: string | null) {
  const from = toLocalISO(getMonday(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: adminStatsQueryKeys.llmUsage({ tenantId: tenantId ?? "", from, to }),
    queryFn: () => adminStatsQueries.llmUsage(tenantId!, { from, to }),
    enabled: tenantId !== null,
  })
}

export function useAdminLlmUsageThisMonth(tenantId: string | null) {
  const from = toLocalISO(getFirstOfMonth(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: adminStatsQueryKeys.llmUsage({ tenantId: tenantId ?? "", from, to }),
    queryFn: () => adminStatsQueries.llmUsage(tenantId!, { from, to }),
    enabled: tenantId !== null,
  })
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

export function useAdminLlmUsageByRange(tenantId: string | null, from: Date, to: Date) {
  const dates = tenantId ? getDatesInRange(from, to) : []

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: adminStatsQueryKeys.llmUsage({ tenantId: tenantId!, date }),
      queryFn: () => adminStatsQueries.llmUsage(tenantId!, { date }),
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
