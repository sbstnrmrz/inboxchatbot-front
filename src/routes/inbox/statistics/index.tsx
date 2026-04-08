import { createFileRoute } from '@tanstack/react-router'
import { ContactsPage } from '@/features/inbox/components/contacts/ContactsPage'
import { usePageTitle } from '@/hooks/usePageTitle'
import { StatisticsPage } from '@/features/inbox/components/statistics/statistics-page'

export const Route = createFileRoute('/inbox/statistics/')({
  component: Statistics,
})

function Statistics() {
  usePageTitle('Estadisticas')
  return <StatisticsPage />
}
