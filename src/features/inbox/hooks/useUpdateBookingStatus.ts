import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { bookingsQueries } from "@/features/inbox/api/bookings.queries"

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bookingsQueries.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookingStats.all() })
    },
  })
}
