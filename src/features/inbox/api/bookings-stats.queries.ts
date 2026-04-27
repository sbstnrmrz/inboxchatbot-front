import { apiClient } from "@/lib/api/client"

export interface BookingCountParams {
  date?: string
  from?: string
  to?: string
}

export interface BookingCountResponse {
  total: number
  pending?: number
  done?: number
  canceled?: number
}

function buildQuery(params?: BookingCountParams): string {
  const searchParams = new URLSearchParams()
  if (params?.date) searchParams.set("date", params.date)
  if (params?.from) searchParams.set("from", params.from)
  if (params?.to) searchParams.set("to", params.to)
  return searchParams.toString()
}

export const bookingStatsQueries = {
  count: (params?: BookingCountParams): Promise<BookingCountResponse> => {
    const query = buildQuery(params)
    return apiClient.get<BookingCountResponse>(
      query ? `/bookings/count?${query}` : `/bookings/count`,
    )
  },
  countCreated: (params?: BookingCountParams): Promise<BookingCountResponse> => {
    const query = buildQuery(params)
    return apiClient.get<BookingCountResponse>(
      query ? `/bookings/count/created?${query}` : `/bookings/count/created`,
    )
  },
}
