import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversationItemProps {
  isSelected?: boolean;
  onClick?: () => void;
}

export function ChatListItem({ isSelected, onClick }: ConversationItemProps) {
  const conversation = {
    lastMessage: 'lorem ipsum',
    unreadCount: 2
  }
  const { lastMessage, unreadCount } = conversation;

  const getChannelIcon = (channel: string) => {
    const size = 'w-4 h-4'
    if (channel === "INSTAGRAM") {
      return <InstagramIcon className={`${size}`}/>
    }

    return <WhatsappIcon className={`${size}`}/>
  }

  // Handle case where customer data is not yet loaded from backend
  return (
    <div
      onClick={() => {}}
      className={`cursor-pointer w-full p-2 bg-white shadow-sm rounded-lg hover:bg-secondary-white`}
    >
      <div className="flex gap-2 items-center">
        <Avatar className="w-12 h-12">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="w-full min-w-0 flex-col">
          <ChatItemHeader/>
          <ChatItemLastMessage/>
        </div>
        {
//      <Skeleton className='rounded-full w-12 h-12 shrink-0'/>
//      <Skeleton className="w-full h-[14px]"/>
        }
      </div>
    </div>
  );
}

function ChatItemHeader() {
  return (
    <div className="w-full flex justify-between">
      <span className="font-semibold">John Doe</span>
      <span className="text-sm">13:23pm</span>
    </div>
  )
}

function ChatItemLastMessage() {
  return (
    <div className="flex w-full items-center">
      <h1 className="text-sm overflow-hidden truncate">lorem ipsom lorem asdjaskdasdjkaskdasd</h1>
      <WhatsappIcon className="w-6 h-6"/>
    </div>
  )
}

