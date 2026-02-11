import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '@/features/auth/context'
import { queryClient } from '@/lib/query-client'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Outlet />
        <TanStackRouterDevtools position='top-right' />
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster/>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export const Route = createRootRoute({ component: RootLayout })
