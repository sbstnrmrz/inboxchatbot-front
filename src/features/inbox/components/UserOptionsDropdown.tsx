import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/context"
import { getBaseLoginUrl } from "@/features/auth/utils/getRedirectPath"
import { EllipsisVerticalIcon, LogOutIcon } from "lucide-react"

export function UserOptionsDropdown() {
  const {signOut, isPending} = useAuth();

  const handleLogout = async() => {
    await signOut();
    window.location.href = getBaseLoginUrl();
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

