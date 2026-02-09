import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarBackgroundColor } from "@/utils/colors"
import { BotIcon, UserIcon } from "lucide-react"

interface AgentAvatarProps {
  agentId?: string;
  isBot?: boolean;
}

export const AgentAvatar = ({ agentId, isBot }: AgentAvatarProps) => {
//  const backgroundColor = isBot ? '#000000' : getAvatarBackgroundColor(agentId || 'test');
  const backgroundColor = '#000000';
  
  return (
    <Avatar className={`w-10 h-10 shrink-0 bg-black`}>
      <AvatarFallback style={{ backgroundColor }}>
        {isBot 
          ? <BotIcon className='w-6 h-6 stroke-white'/>
          : <UserIcon className={`w-6 h-6 stroke-white`}/>
        }
      </AvatarFallback>
    </Avatar>
  )
}

