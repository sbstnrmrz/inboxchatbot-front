import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarBackgroundColor } from "@/utils/colors"
import { UserIcon } from "lucide-react"

interface CustomerAvatarProps {
  customerId?: string;
}

export const CustomerAvatar = ({ customerId }: CustomerAvatarProps) => {
  const backgroundColor = getAvatarBackgroundColor(customerId || 'test');
  
  return (
    <Avatar className="w-10 h-10 shrink-0">
      <AvatarFallback style={{ backgroundColor }}>
        <UserIcon className='w-6 h-6 stroke-white'/>
      </AvatarFallback>
    </Avatar>
  )
}

