import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/features/auth/context"
import { useNavigate } from "@tanstack/react-router"
import type { User } from "better-auth"
import { EllipsisVertical, LogOutIcon } from "lucide-react"

interface Props {
  user?: User
}

export function InboxLayoutFooter({user}: Props) {
  const { isMobile } = useSidebar()
  const { signOut, isPending } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async() => {
    await signOut();
    navigate({to: '/auth/login'})
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer bg-white shadow-2xl" asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name || 'Cargando...'}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email || 'Cargando...'}
                </span>
              </div>
              <EllipsisVertical />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={handleLogout}
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

