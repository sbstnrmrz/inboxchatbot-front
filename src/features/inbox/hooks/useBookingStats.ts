import { useQueries, useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { bookingStatsQueries } from "@/features/inbox/api/bookings-stats.queries"

function toLocalISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getSunday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? 0 : 7 - day
  d.setDate(d.getDate() + diff)
  return d
}

function getLastOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function useBookingCountToday() {
  const today = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.bookingStats.count({ date: today }),
    queryFn: () => bookingStatsQueries.count({ date: today }),
  })
}

export function useBookingCountThisWeek() {
  const from = toLocalISO(new Date())
  const to = toLocalISO(getSunday(new Date()))
  return useQuery({
    queryKey: queryKeys.bookingStats.count({ from, to }),
    queryFn: () => bookingStatsQueries.count({ from, to }),
  })
}

export function useBookingCountThisMonth() {
  const from = toLocalISO(new Date())
  const to = toLocalISO(getLastOfMonth(new Date()))
  return useQuery({
    queryKey: queryKeys.bookingStats.count({ from, to }),
    queryFn: () => bookingStatsQueries.count({ from, to }),
  })
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

export function useBookingCreatedToday() {
  const today = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.bookingStats.countCreated({ date: today }),
    queryFn: () => bookingStatsQueries.countCreated({ date: today }),
  })
}

export function useBookingCreatedThisWeek() {
  const from = toLocalISO(getMonday(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.bookingStats.countCreated({ from, to }),
    queryFn: () => bookingStatsQueries.countCreated({ from, to }),
  })
}

export function useBookingCreatedThisMonth() {
  const from = toLocalISO(getFirstOfMonth(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.bookingStats.countCreated({ from, to }),
    queryFn: () => bookingStatsQueries.countCreated({ from, to }),
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

export interface DailyBookingCount {
  date: string
  total: number
}

export function useBookingCountByRange(from: Date, to: Date) {
  const dates = getDatesInRange(from, to)

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: queryKeys.bookingStats.count({ date }),
      queryFn: () => bookingStatsQueries.count({ date }),
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const data: DailyBookingCount[] = dates.map((date, i) => ({
    date,
    total: results[i].data?.total ?? 0,
  }))

  return { data, isLoading, isError }
}
