import { createFileRoute } from '@tanstack/react-router'
import { UsersTable } from '@/features/admin/components/users/UsersTable'
import { CreateUserModal } from '@/features/admin/components/users/CreateUserModal'

export const Route = createFileRoute('/admin/dashboard/users/')({
  component: Users,
})

function Users() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Usuarios</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona los usuarios registrados en la plataforma.
          </p>
        </div>
        <CreateUserModal />
      </div>

      <UsersTable />
    </div>
  )
}
