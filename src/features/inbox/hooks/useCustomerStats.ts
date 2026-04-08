import { useQueries, useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { customerStatsQueries } from "@/features/inbox/api/customers-stats.queries"

export function useCustomerTotalCount() {
  return useQuery({
    queryKey: queryKeys.customerStats.count(),
    queryFn: () => customerStatsQueries.count(),
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

export function useCustomerCountToday() {
  const today = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.customerStats.count({ date: today }),
    queryFn: () => customerStatsQueries.count({ date: today }),
  })
}

export function useCustomerCountThisWeek() {
  const from = toLocalISO(getMonday(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.customerStats.count({ from, to }),
    queryFn: () => customerStatsQueries.count({ from, to }),
  })
}

export function useCustomerCountThisMonth() {
  const from = toLocalISO(getFirstOfMonth(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.customerStats.count({ from, to }),
    queryFn: () => customerStatsQueries.count({ from, to }),
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

export interface DailyCustomerCount {
  date: string
  count: number
}

export function useCustomerCountByRange(from: Date, to: Date) {
  const dates = getDatesInRange(from, to)

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: queryKeys.customerStats.count({ date }),
      queryFn: () => customerStatsQueries.count({ date }),
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const data: DailyCustomerCount[] = dates.map((date, i) => ({
    date,
    count: results[i].data?.count ?? 0,
  }))

  return { data, isLoading, isError }
}
