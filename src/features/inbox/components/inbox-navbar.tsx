import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/context";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { LogOutIcon, MessageSquareIcon, MoonIcon, SunIcon, UsersIcon } from "lucide-react"

const navItems = [
  {label: 'Chats', icon: <MessageSquareIcon className="text-black w-5 h-5"/>, link: '/inbox'},
  {label: 'Contacts', icon: <UsersIcon className="text-black w-5 h-5"/>, link: '/inbox/contacts'},
]

export const InboxNavBar = () => {
  const { signOut, isPending } = useAuth();
  const location = useRouterState({ select: (s) => s.location })

  const navigate = useNavigate();
  const {theme, toggleTheme} = useTheme();

  const handleLogout = async() => {
    await signOut();
    navigate({to: '/auth/login'})
  }

  return (
    <div className='flex flex-col w-[52px] h-screen bg-white border-r border-r-secondary-white '>
      <div className='h-[52px]'>
      </div>
      <div className='flex items-center flex-col gap-2'>
        {navItems.map((item) => {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={`cursor-pointer ${item.link === location.pathname ? 'bg-secondary-white' : ''} hover:bg-secondary-white p-2 rounded-sm`}
                  onClick={() => {
                    navigate({to: item.link})
                  }}
                >
                  {item.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="shadow-xl bg-white">
                <p className="text-black">{item.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
      <div className='mt-auto'>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer w-full h-[52px] bg-white shadow-2xl  hover:bg-primary-white" asChild>
            <div className="flex justify-center items-center w-full">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) flex flex-col gap-1 min-w-56 rounded-lg"
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
      </div>
    </div>
  )
}

