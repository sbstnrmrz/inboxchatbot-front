import { useMemo, useState } from 'react';
import { LogOutIcon, MessageCircleMoreIcon, MessageSquareIcon, MoonIcon, SunIcon, UsersIcon } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SearchFilter } from './SearchFilter';
import { useAuth } from '@/features/auth/context';
import { useSocket } from '@/features/sockets/hooks/useSocket';
import { useInitialSync } from '@/features/inbox/hooks/useInitialSync';
import { useMessageEvents } from '@/features/inbox/hooks/useMessageEvents';
import { useConversationReadEvent } from '@/features/inbox/hooks/useConversationReadEvent';
import { useConversationEvents } from '@/features/inbox/hooks/useConversationEvents';
import { useRequestAgentEvent } from '@/features/inbox/hooks/useRequestAgentEvent';
import { ChatLayout } from './chat-layout';
import { ChatMain } from './chat-main';
import { ChatList } from './chat-list';
import { ChatLayoutHeader } from './chat-layout-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { InboxNavBar } from './inbox-navbar';
import { logger } from '@/lib/logger';

interface InboxLayoutProps {
  conversationId?: string 
}

export function InboxLayout({conversationId}: InboxLayoutProps) {
  const {socket, isConnected} = useSocket();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationId || null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
  const { session, signOut, isPending } = useAuth();
  const [showContactDetails, setShowContactDetails] = useState(false);
  logger.debug('selected conversationId: ' + selectedConversationId);

  // Trigger initial sync as soon as the session is confirmed
  useInitialSync({ enabled: !isPending && !!session });

  // Listen for real-time message events and persist them into IndexedDB
  useMessageEvents({ socket });

  // Listen for real-time conversation events (created, updated, deleted)
  useConversationEvents({ socket });

  // Emit conversation_read when a conversation is selected and listen for
  // re-broadcasts from the server to keep the unread badge in sync.
  useConversationReadEvent({ socket, conversationId: selectedConversationId });

  // Listen for request_agent events — patches IndexedDB and shows a toast
  // that allows the agent to navigate directly to the conversation.
  useRequestAgentEvent({ socket });

  return (
    <>
      {/* Vista móvil - solo lista O chat */}


      {/* Vista desktop - sidebar + chat */}
      <Sidebar collapsible="icon" className="flex border-r">
        <SidebarHeader className='bg-primary-white border-b border-secondary-white min-h-[52px] justify-center'>
          <div className="flex w-full items-center ">
            <h1 className=" text-lg font-semibold group-data-[collapsible=icon]:hidden">Chats</h1>
          </div>
        </SidebarHeader>
        <div className="flex items-center p-2 bg-primary-white border-b border-secondary-white group-data-[collapsible=icon]:hidden">
          <SearchFilter value={searchQuery} onChange={setSearchQuery} />
        </div>
        <ChatList onChatSelected={setSelectedConversationId} selectedConversationId={selectedConversationId}/>
        <SidebarContent>
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className=''>
        {!selectedConversationId
          ?
          <NoChatSelected/>
          :
          <ChatLayout>
            <ChatLayoutHeader 
              conversationId={selectedConversationId} 
              onShowContactDetails={setShowContactDetails}
            />
            <ChatMain
              conversationId={selectedConversationId} 
              socket={socket} 
              showContactDetails={showContactDetails}
            />
          </ChatLayout>
        }
      </SidebarInset>
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
