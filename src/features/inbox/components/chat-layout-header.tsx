import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const ChatLayoutHeader = () => {
  return (
    <div className="flex items-center px-2 py-1 w-full h-[52px] border-b-1 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <Avatar size="lg" className=" h-full">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span>John Doe</span>
      </div>
    </div>
  )
}

