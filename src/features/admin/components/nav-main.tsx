"use client"

import { Building2, Building2Icon, ChartNoAxesCombined, ChevronRight, IdCard, Map, Users, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useNavigate, useRouter } from "@tanstack/react-router"

const links = [
  {
    title: "Tenants",
    path: "/tenants",
    icon: Building2,
  },
  {
    title: "Membresías",
    path: "/memberships",
    icon: IdCard,
  },
  {
    title: "Usuarios",
    path: "/users",
    icon: Users,
  },
  {
    title: "Estadísticas",
    path: "/statistics",
    icon: ChartNoAxesCombined,
  },
]

export function NavMain() {
  const navigate = useNavigate();
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {links.map((item) => (
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="cursor-pointer" 
              tooltip={item.title}
              onClick={() => {
                navigate({to: `/admin/dashboard/${item.path}`})
              }}
            >
              {item.icon && <item.icon/>}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

