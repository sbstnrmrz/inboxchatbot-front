import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { conversationStatsQueries } from "@/features/inbox/api/conversations-stats.queries"

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

export function useConversationCountToday() {
  const today = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.conversationStats.count({ date: today }),
    queryFn: () => conversationStatsQueries.count({ date: today }),
  })
}

export function useConversationCountThisWeek() {
  const from = toLocalISO(getMonday(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.conversationStats.count({ from, to }),
    queryFn: () => conversationStatsQueries.count({ from, to }),
  })
}

export function useConversationCountThisMonth() {
  const from = toLocalISO(getFirstOfMonth(new Date()))
  const to = toLocalISO(new Date())
  return useQuery({
    queryKey: queryKeys.conversationStats.count({ from, to }),
    queryFn: () => conversationStatsQueries.count({ from, to }),
  })
}
