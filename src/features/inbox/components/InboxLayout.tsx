import { useState, useMemo, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { User, Settings, LogOut, HelpCircle, MoreVertical, Plus, SearchIcon, EllipsisVertical, EllipsisVerticalIcon } from 'lucide-react';
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
import { MessageEvent } from '@/features/sockets/types/events';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';


export function InboxLayout() {
  const {socket, isConnected} = useSocket();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
  const {session} = useAuth();

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
            <SidebarHeader className='bg-primary-white border-b border-secondary-white h-[52px] justify-center'>
                <div className="flex w-full items-center justify-center">
                  <h1 className=" text-lg font-semibold group-data-[collapsible=icon]:hidden">Chats</h1>
                </div>
            </SidebarHeader>
            <div className="flex items-center px-4 py-2 bg-primary-white border-b border-secondary-white group-data-[collapsible=icon]:hidden">
              <span className='text-sm mr-2'>Filtrar por</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-primary-white border-b border-secondary-white group-data-[collapsible=icon]:hidden">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} />
            </div>
            <SidebarContent>
            </SidebarContent>
            <SidebarFooter>
              <InboxLayoutFooter user={session?.user}/>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <form
              className='flex gap-2 p-4'
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim();
                if (!socket || !message) return;
                socket.emit(MessageEvent.Sent, { message });
                logger.debug('Message sent');
                logger.debug(message);
                form.reset();
              }}
            >
              <Textarea name='message' placeholder='Test socket message...' className='w-full' />
              <Button type='submit' disabled={!isConnected}>Send</Button>
            </form>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}

