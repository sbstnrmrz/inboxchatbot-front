import { createFileRoute } from '@tanstack/react-router'
import { TenantsTable } from '@/features/admin/components/tenants/TenantsTable'
import { CreateTenantModal } from '@/features/admin/components/tenants/CreateTenantModal'
import { usePageTitle } from '@/hooks/usePageTitle'

export const Route = createFileRoute('/admin/dashboard/tenants/')({
  component: Tenants,
})

function Tenants() {
  usePageTitle('Tenants')
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Tenants</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona los tenants registrados en la plataforma.
          </p>
        </div>
        <CreateTenantModal />
      </div>

      <TenantsTable />
    </div>
  )
}
