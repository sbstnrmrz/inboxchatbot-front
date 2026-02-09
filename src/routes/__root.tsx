import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AuthProvider } from '@/features/auth/context'

const RootLayout = () => (
  <AuthProvider>
    <Outlet />
    <TanStackRouterDevtools position='top-right'/>
  </AuthProvider>
)

export const Route = createRootRoute({ component: RootLayout })
