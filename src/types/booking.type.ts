export type BookingStatus = "PENDING" | "DONE" | "CANCELED"

export interface Booking {
  _id: string
  customerId: string
  startDate: string
  endDate: string
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

export interface BookingWithCustomer extends Booking {
  customerName: string
}

export interface BookingsResponse {
  data: BookingWithCustomer[]
  total: number
  page: number
  limit: number
  totalPages: number
}
