import { apiClient } from "@/lib/api/client"
import type { BookingStatus, BookingsResponse } from "@/types/booking.type"

interface BookingsListParams {
  page?: number
  limit?: number
  status?: string
}

export const bookingsQueries = {
  list: ({ page = 1, limit = 20, status }: BookingsListParams = {}) => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", String(limit))
    if (status) params.set("status", status)
    return apiClient.get<BookingsResponse>(`/bookings?${params.toString()}`)
  },
  updateStatus: ({ id, status }: { id: string; status: BookingStatus }) =>
    apiClient.patch(`/bookings/${id}/status`, { status }),
}
