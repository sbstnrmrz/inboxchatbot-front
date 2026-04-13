import { useState } from 'react';
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, MessageCircleMoreIcon, SearchIcon, XIcon } from 'lucide-react';
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
import { Field } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { BotStatusSwitch } from './BotStatusSwitch';
import { useTenantBotStatus, useToggleTenantBot } from '@/features/inbox/hooks/useTenantBotStatus';
import { useBotToggledEvent } from '@/features/inbox/hooks/useBotToggledEvent';

interface InboxLayoutProps {
  conversationId?: string 
}

export function InboxLayout({conversationId}: InboxLayoutProps) {
  const {socket} = useSocket();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationId || null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { session, isPending } = useAuth();
  const [showContactDetails, setShowContactDetails] = useState(false)
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const [messageSearchQuery, setMessageSearchQuery] = useState("")
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [matchCount, setMatchCount] = useState(0)

  const handleSelectConversation = (id: string | null) => {
    setSelectedConversationId(id)
    setShowMessageSearch(false)
    setMessageSearchQuery("")
    setCurrentMatchIndex(0)
    setMatchCount(0)
  }

  const handleToggleSearch = () => {
    setShowMessageSearch(prev => !prev)
    setMessageSearchQuery("")
    setCurrentMatchIndex(0)
    setMatchCount(0)
  }

  const handleSearchQueryChange = (query: string) => {
    setMessageSearchQuery(query)
    setCurrentMatchIndex(0)
  };
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

  // Listen for bot_toggled events — keeps tenant bot status in sync across tabs/agents.
  useBotToggledEvent({ socket });

  const { data: botStatusData } = useTenantBotStatus()
  const { mutate: toggleTenantBot, isPending: isTogglingBot } = useToggleTenantBot()

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
            onBack={() => { handleSelectConversation(null); setShowContactDetails(false) }}
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
        <div className="flex items-center justify-between px-4 h-[52px] bg-white dark:bg-card border-b border-secondary-white shrink-0">
          <h1 className="text-lg font-semibold">Chats</h1>
          <div className="flex items-center gap-2">
            <BotStatusSwitch
              botEnabled={botStatusData?.botEnabled ?? false}
              onToggleBotEnabled={() => toggleTenantBot()}
              isTogglingBot={isTogglingBot}
            />
          </div>
        </div>
        <div className="flex items-center p-2 bg-primary-white border-b border-secondary-white shrink-0">
          <SearchFilter value={searchQuery} onChange={setSearchQuery} />
        </div>
        <ChatList
          onChatSelected={handleSelectConversation}
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
          <div className="flex w-full items-center justify-between">
            <h1 className=" text-lg font-semibold group-data-[collapsible=icon]:hidden">Chats</h1>
            <div className="flex items-center gap-2">
              <BotStatusSwitch
                botEnabled={botStatusData?.botEnabled ?? false}
                onToggleBotEnabled={() => toggleTenantBot()}
                isTogglingBot={isTogglingBot}
              />
            </div>
          </div>
        </SidebarHeader>
        <div className="flex items-center p-2 bg-primary-white border-b border-secondary-white group-data-[collapsible=icon]:hidden">
          <SearchFilter value={searchQuery} onChange={setSearchQuery} />
        </div>
        <ChatList
          onChatSelected={handleSelectConversation}
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
              onToggleSearch={handleToggleSearch}
            />
            {showMessageSearch && (
              <div className='flex items-center gap-1 p-1 w-full'>
                <Field className="flex-1">
                  <InputGroup>
                    <InputGroupInput
                      id="search-input"
                      placeholder="Texto del mensaje"
                      value={messageSearchQuery}
                      onChange={(e) => handleSearchQueryChange(e.target.value)}
                      autoFocus
                    />
                    <InputGroupAddon align="inline-start">
                      <SearchIcon className="text-muted-foreground" />
                    </InputGroupAddon>
                    {messageSearchQuery && (
                      <InputGroupAddon align="inline-end">
                        <button onClick={() => handleSearchQueryChange("")} className="cursor-pointer text-muted-foreground hover:text-foreground">
                          <XIcon className="size-4" />
                        </button>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                </Field>
                {messageSearchQuery && matchCount > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground shrink-0">{currentMatchIndex + 1}/{matchCount}</span>
                    <button
                      className="p-1 hover:bg-secondary-white rounded-sm cursor-pointer"
                      onClick={() => setCurrentMatchIndex(i => (i - 1 + matchCount) % matchCount)}
                    >
                      <ChevronUpIcon className="size-4 text-muted-foreground" />
                    </button>
                    <button
                      className="p-1 hover:bg-secondary-white rounded-sm cursor-pointer"
                      onClick={() => setCurrentMatchIndex(i => (i + 1) % matchCount)}
                    >
                      <ChevronDownIcon className="size-4 text-muted-foreground" />
                    </button>
                  </>
                )}
              </div>
            )}
            <ChatMain
              conversationId={selectedConversationId}
              socket={socket}
              showContactDetails={showContactDetails}
              messageSearchQuery={messageSearchQuery}
              currentMatchIndex={currentMatchIndex}
              onMatchCountChange={setMatchCount}
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
