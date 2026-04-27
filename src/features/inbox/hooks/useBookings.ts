import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { bookingsQueries } from "@/features/inbox/api/bookings.queries"

interface UseBookingsOptions {
  enabled?: boolean
  page?: number
  limit?: number
  status?: string
}

export function useBookings({ enabled = true, page = 1, limit = 20, status }: UseBookingsOptions = {}) {
  return useQuery({
    queryKey: queryKeys.bookings.list({ page, limit, status }),
    enabled,
    queryFn: () => bookingsQueries.list({ page, limit, status }),
    staleTime: 0,
  })
}
