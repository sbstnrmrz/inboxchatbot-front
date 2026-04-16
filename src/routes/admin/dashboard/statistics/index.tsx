import { createFileRoute } from '@tanstack/react-router'
import { AdminStatisticsPage } from '@/features/admin/components/statistics/statistics-page'
import { usePageTitle } from '@/hooks/usePageTitle'

export const Route = createFileRoute('/admin/dashboard/statistics/')({
  component: Statistics,
})

function Statistics() {
  usePageTitle('Estadísticas')
  return <AdminStatisticsPage />
}
