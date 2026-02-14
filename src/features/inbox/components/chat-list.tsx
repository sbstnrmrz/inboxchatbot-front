import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HandIcon, UserIcon } from 'lucide-react';
import { CustomerAvatar } from './CustomerAvatar';
import { WhatsappIcon } from '@/components/icons/WhatsappIcon'
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatListItem } from './chat-list-item';

export const ChatList = () => {
  return (
    <div className='flex flex-col w-full p-2 overflow-scroll gap-2'>
      {Array.from({length: 14}, (_, i) => {
       return <ChatListItem key={i}/>
      })}

    </div>
  )
}

