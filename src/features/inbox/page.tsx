import { SidebarProvider } from "@/components/ui/sidebar"
import { InboxNavBar } from "./components/inbox-navbar"
import { Outlet } from "@tanstack/react-router"
import { useIsMobile } from "@/hooks/use-mobile"

export const InboxPage = () => {
  const isMobile = useIsMobile()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen overflow-hidden">
        {!isMobile && <InboxNavBar />}
        <Outlet />
      </div>
    </SidebarProvider>
  )
}



