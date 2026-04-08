import { useQueries, useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { messageStatsQueries } from "@/features/inbox/api/messages-stats.queries"

export function useMessageTotalCount() {
  return useQuery({
    queryKey: queryKeys.messageStats.count(),
    queryFn: () => messageStatsQueries.count(),
  })
}

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

export function useMessageCountToday() {
  const today = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.messageStats.count({ date: today }),
    queryFn: () => messageStatsQueries.count({ date: today }),
  })
}

export function useMessageCountThisWeek() {
  const from = toLocalISO(getMonday(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.messageStats.count({ from, to }),
    queryFn: () => messageStatsQueries.count({ from, to }),
  })
}

export function useMessageCountThisMonth() {
  const from = toLocalISO(getFirstOfMonth(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.messageStats.count({ from, to }),
    queryFn: () => messageStatsQueries.count({ from, to }),
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

export interface DailyMessageCount {
  date: string
  count: number
}

export function useMessageCountByRange(from: Date, to: Date) {
  const dates = getDatesInRange(from, to)

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: queryKeys.messageStats.count({ date }),
      queryFn: () => messageStatsQueries.count({ date }),
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const data: DailyMessageCount[] = dates.map((date, i) => ({
    date,
    count: results[i].data?.count ?? 0,
  }))

  return { data, isLoading, isError }
}
