import { createFileRoute } from '@tanstack/react-router'
import { BookingsPage } from '@/features/inbox/components/bookings/BookingsPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export const Route = createFileRoute('/inbox/bookings/')({
  component: Bookings,
})

function Bookings() {
  usePageTitle('Agendamientos')
  return <BookingsPage />
}
