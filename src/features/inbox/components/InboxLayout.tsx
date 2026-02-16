import { useState, useMemo, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { User, Settings, LogOut, HelpCircle, MoreVertical, Plus, SearchIcon, EllipsisVertical, EllipsisVerticalIcon, MessageCircleMoreIcon } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomerAvatar } from './CustomerAvatar';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { UserOptionsDropdown } from './UserOptionsDropdown';
import { ChannelFilters } from './ChannelFilters';
import { SearchFilter } from './SearchFilter';
import { InboxLayoutFooter } from './InboxLayoutFooter';
import { useAuth } from '@/features/auth/context';
import { useSocket } from '@/features/sockets/hooks/useSocket';
import { useInitialSync } from '@/features/inbox/hooks/useInitialSync';
import { MessageEvent } from '@/features/sockets/types/events';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { ChatLayout } from './chat-layout';
import { MessageInput } from './message-input';
import { ChatMain } from './chat-main';
import { ChatList } from './chat-list';
import { ChatLayoutHeader } from './chat-layout-header';


export function InboxLayout() {
  const {socket, isConnected} = useSocket();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
  const { session, isPending } = useAuth();

  // Trigger initial sync as soon as the session is confirmed
  useInitialSync({ enabled: !isPending && !!session });

  useEffect(() => {
    const handleMessageReceived = (data: any) => {
      logger.debug(`Message received`);
      logger.debug(data);
    }
    
    socket?.on(MessageEvent.Received, handleMessageReceived)
    logger.debug(`Message Received listener set`);

    return () => {
      socket?.off(MessageEvent.Received, handleMessageReceived);
    }

  }, [socket])

  return (
    <>
      {/* Vista móvil - solo lista O chat */}

      {/* Vista desktop - sidebar + chat */}
      <SidebarProvider defaultOpen={true}>
        <div className="hidden md:flex h-screen w-screen overflow-hidden">
          <Sidebar collapsible="icon" className="flex border-r">
            <SidebarHeader className='bg-primary-white border-b border-secondary-white min-h-[52px] justify-center'>
              <div className="flex w-full items-center ">
                <h1 className=" text-lg font-semibold group-data-[collapsible=icon]:hidden">Chats</h1>
              </div>
            </SidebarHeader>
            <div className="flex items-center p-2 bg-primary-white border-b border-secondary-white group-data-[collapsible=icon]:hidden">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="flex items-center px-4 py-2 bg-primary-white border-b border-secondary-white group-data-[collapsible=icon]:hidden">
              <span className='text-sm mr-2'>Filtrar por</span>
            </div>
            <ChatList onChatSelected={setSelectedConversationId}/>
            <SidebarContent>
            </SidebarContent>
            <SidebarFooter>
              <InboxLayoutFooter user={session?.user}/>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className=''>
            {!selectedConversationId
              ?
              <NoChatSelected/>
              :
              <ChatLayout>
                <ChatLayoutHeader/>
                <ChatMain conversationId={selectedConversationId} />
              </ChatLayout>
            }
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}

function NoChatSelected() {
  return (
    <div className='flex flex-col m-auto gap-4 items-center justify-between'>
      <MessageCircleMoreIcon className='text-gray-500' size={148}/>
      <span className='text-lg text-gray-500'>Selecciona un chat</span>
    </div>
  )
}

