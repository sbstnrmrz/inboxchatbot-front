import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/admin/')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()
    
    // Si no está autenticado, redirigir a login
    if (!data) {
      throw redirect({ to: '/auth/login' })
    }
    
    // Si no es superadmin, redirigir a inbox
    const userRole = data.user?.role
    if (userRole !== 'superadmin' && userRole !== 'super-admin') {
      throw redirect({ to: '/inbox' })
    }
    
    // Si es superadmin, redirigir al dashboard
    throw redirect({ to: '/admin/dashboard' })
  },
  component: Admin,
})

function Admin() {
  return <div>Hello "/admin/"!</div>
}
