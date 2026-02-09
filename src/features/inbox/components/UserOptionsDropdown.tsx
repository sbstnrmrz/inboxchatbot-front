import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/context"
import { useNavigate } from "@tanstack/react-router"
import {
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  EllipsisVerticalIcon,
  LogOutIcon,
} from "lucide-react"

export function UserOptionsDropdown() {
  const {signOut, isPending} = useAuth();
  const navigate = useNavigate();

  const handleLogout = async() => {
    await signOut(); 
    navigate({to: '/auth/login'});
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'none'}  className="p-1 cursor-pointer hover:bg-secondary-white rounded-full">
          <EllipsisVerticalIcon/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout} disabled={isPending}>
          <LogOutIcon />
          {isPending ? "Signing out..." : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

