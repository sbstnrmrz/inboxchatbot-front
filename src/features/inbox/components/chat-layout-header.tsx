import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const ChatLayoutHeader = () => {
  return (
    <div className="flex items-center px-4 py-1 w-full h-[52px] border-b-1 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <Avatar className="w-10 h-10">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span>John Doe</span>
      </div>
    </div>
  )
}

