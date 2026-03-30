import { useState } from 'react';
import { ArrowLeftIcon, MessageCircleMoreIcon } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SearchFilter } from './SearchFilter';
import { useAuth } from '@/features/auth/context';
import { useSocket } from '@/features/sockets/hooks/useSocket';
import { useInitialSync } from '@/features/inbox/hooks/useInitialSync';
import { useMessageEvents } from '@/features/inbox/hooks/useMessageEvents';
import { useConversationReadEvent } from '@/features/inbox/hooks/useConversationReadEvent';
import { useConversationEvents } from '@/features/inbox/hooks/useConversationEvents';
import { useRequestAgentEvent } from '@/features/inbox/hooks/useRequestAgentEvent';
import { useDismissAgentEvent } from '@/features/inbox/hooks/useDismissAgentEvent';
import { useTagEvents } from '@/features/inbox/hooks/useTagEvents';
import { ChatLayout } from './chat-layout';
import { ChatMain } from './chat-main';
import { ChatList } from './chat-list';
import { ChatLayoutHeader } from './chat-layout-header';
import { logger } from '@/lib/logger';
import { useIsMobile } from '@/hooks/use-mobile';

interface InboxLayoutProps {
  conversationId?: string 
}

export function InboxLayout({conversationId}: InboxLayoutProps) {
  const {socket} = useSocket();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationId || null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { session, isPending } = useAuth();
  const [showContactDetails, setShowContactDetails] = useState(false);
  logger.debug('selected conversationId: ' + selectedConversationId);

  // Trigger initial sync as soon as the session is confirmed
  const { hasNextPage, fetchNextPage, isFetchingNextPage } = useInitialSync({ enabled: !isPending && !!session });

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

  // Listen for dismiss_agent events — clears requestingAgent flag in IndexedDB.
  useDismissAgentEvent({ socket });

  // Listen for tag events — keeps tags and conversation tag assignments in sync.
  useTagEvents({ socket });

  const isMobile = useIsMobile()

  if (isMobile) {
    if (selectedConversationId && showContactDetails) {
      return (
        <div className="flex flex-col h-screen">
          <div className="flex items-center gap-2 px-4 h-[52px] bg-white dark:bg-card border-b border-secondary-white shrink-0">
            <button className="p-1 hover:bg-secondary-white rounded-sm" onClick={() => setShowContactDetails(false)}>
              <ArrowLeftIcon className="stroke-foreground w-5 h-5" />
            </button>
            <span className="font-semibold">Detalles del contacto</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* TODO: contact details content */}
          </div>
        </div>
      )
    }

    if (selectedConversationId) {
      return (
        <div className="flex flex-col h-screen">
          <ChatLayoutHeader
            conversationId={selectedConversationId}
            onShowContactDetails={setShowContactDetails}
            onBack={() => { setSelectedConversationId(null); setShowContactDetails(false) }}
          />
          <ChatMain
            conversationId={selectedConversationId}
            socket={socket}
            showContactDetails={false}
          />
        </div>
      )
    }

    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center px-4 h-[52px] bg-white dark:bg-card border-b border-secondary-white shrink-0">
          <h1 className="text-lg font-semibold">Chats</h1>
        </div>
        <div className="flex items-center p-2 bg-primary-white border-b border-secondary-white shrink-0">
          <SearchFilter value={searchQuery} onChange={setSearchQuery} />
        </div>
        <ChatList
          onChatSelected={setSelectedConversationId}
          selectedConversationId={selectedConversationId}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          searchQuery={searchQuery}
        />
      </div>
    )
  }

  return (
    <>
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
        <ChatList
          onChatSelected={setSelectedConversationId}
          selectedConversationId={selectedConversationId}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          searchQuery={searchQuery}
        />
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
      <MessageCircleMoreIcon className='text-gray-500 dark:text-gray-400' size={148}/>
      <span className='text-lg text-gray-500 dark:text-gray-400'>Selecciona un chat</span>
    </div>
  )
}
