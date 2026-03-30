import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { getBaseLoginUrl } from "@/features/auth/utils/getRedirectPath"
import { useTheme } from "@/hooks/use-theme"
import type { User } from "better-auth"
import { EllipsisVertical, LogOutIcon, MoonIcon, SunIcon } from "lucide-react"

interface Props {
  user?: User
}

export function InboxLayoutFooter({user}: Props) {
  const { isMobile } = useSidebar()
  const { signOut, isPending } = useAuth();
  const {theme, toggleTheme} = useTheme();

  const handleLogout = async() => {
    await signOut();
    window.location.href = getBaseLoginUrl();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer h-[52px] bg-white dark:bg-card shadow-2xl border-t-1 border-t-secondary-white hover:bg-primary-white" asChild>
        <div className="flex gap-2 p-2 items-center">
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.name || 'Cargando...'}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.email || 'Cargando...'}
            </span>
          </div>
          <EllipsisVertical size={20} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) flex flex-col gap-1 min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "top"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          Change Theme 
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={handleLogout}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}

