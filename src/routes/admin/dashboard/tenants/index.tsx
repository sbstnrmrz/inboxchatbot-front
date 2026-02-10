import { createFileRoute } from '@tanstack/react-router'
import { TenantsTable } from '@/features/admin/components/tenants/TenantsTable'
import { CreateTenantForm } from '@/features/admin/components/CreateTenantForm'

export const Route = createFileRoute('/admin/dashboard/tenants/')({
  component: Tenants,
})

function Tenants() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Tenants</h1>
        <p className="text-muted-foreground text-sm">
          Gestiona los tenants registrados en la plataforma.
        </p>
      </div>

      <TenantsTable />
      <div>
        <h2 className="text-lg font-semibold mb-4">Nuevo tenant</h2>
        <CreateTenantForm />
      </div>
    </div>
  )
}
