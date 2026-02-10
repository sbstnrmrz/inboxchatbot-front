import { CreateTenantForm } from '@/features/admin/components/CreateTenantForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/dashboard/tenants/')({
  component: Tenants,
})

function Tenants() {
  return (
    <div>
      <CreateTenantForm/>
    </div>
  ) 
}
