import { SidebarProvider } from "@/components/ui/sidebar"
import { InboxNavBar } from "./components/inbox-navbar"
import { Outlet } from "@tanstack/react-router"

export const InboxPage = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="hidden md:flex h-screen w-screen overflow-hidden">
        <InboxNavBar/>
        <Outlet/>
      </div>
    </SidebarProvider>
  )
}



