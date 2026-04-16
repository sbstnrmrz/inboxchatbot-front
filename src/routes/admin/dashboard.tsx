import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { DashboardSidebar } from "@/features/admin/components/DashboardSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()

    if (!data) {
      throw redirect({ to: '/auth/login' })
    }

    const userRole = data.user?.role
    if (userRole !== 'superadmin' && userRole !== 'super-admin') {
      throw redirect({ to: '/inbox' })
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <DashboardSidebar />
      <SidebarInset className="overflow-y-auto">
        <header className="flex bg-white dark:bg-[#1a1a1a] border-b border-secondary-white shadow-xs h-10 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
