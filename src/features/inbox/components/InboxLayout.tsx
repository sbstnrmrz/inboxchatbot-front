import { useMemo, useState } from 'react';
import { LogOutIcon, MessageCircleMoreIcon, MoonIcon, SunIcon, UsersIcon } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { UserOptionsDropdown } from './UserOptionsDropdown';
import { SearchFilter } from './SearchFilter';
import { InboxLayoutFooter } from './InboxLayoutFooter';
import { useAuth } from '@/features/auth/context';
import { useSocket } from '@/features/sockets/hooks/useSocket';
import { useInitialSync } from '@/features/inbox/hooks/useInitialSync';
import { useMessageEvents } from '@/features/inbox/hooks/useMessageEvents';
import { useConversationReadEvent } from '@/features/inbox/hooks/useConversationReadEvent';
import { ChatLayout } from './chat-layout';
import { ChatMain } from './chat-main';
import { ChatList } from './chat-list';
import { ChatLayoutHeader } from './chat-layout-header';
import type { ConversationChannel } from '@/types/conversation.type';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from '@tanstack/react-router';
import { useTheme } from '@/hooks/use-theme';


export function InboxLayout() {
  const {socket, isConnected} = useSocket();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
  const { session, signOut, isPending } = useAuth();
  const [showContactDetails, setShowContactDetails] = useState(false);

  const navigate = useNavigate();
  const {theme, toggleTheme} = useTheme();

  const handleLogout = async() => {
    await signOut();
    navigate({to: '/auth/login'})
  }


  // Trigger initial sync as soon as the session is confirmed
  useInitialSync({ enabled: !isPending && !!session });

  // Listen for real-time message events and persist them into IndexedDB
  useMessageEvents({ socket });

  // Emit conversation_read when a conversation is selected and listen for
  // re-broadcasts from the server to keep the unread badge in sync.
  useConversationReadEvent({ socket, conversationId: selectedConversationId });

  return (
    <>
      {/* Vista móvil - solo lista O chat */}


      {/* Vista desktop - sidebar + chat */}
      <SidebarProvider defaultOpen={true}>
        <div className="hidden md:flex h-screen w-screen overflow-hidden">
          <div className='flex flex-col w-[52px] h-screen bg-green-400'>
            <div className='h-[52px]'>
            </div>
            <div>
              <UsersIcon/>
            </div>
            <div className='mt-auto'>
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer h-[52px] bg-white shadow-2xl border-t-1 border-t-secondary-white hover:bg-primary-white" asChild>
                  <div className="flex gap-2 p-2 items-center">
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) flex flex-col gap-1 min-w-56 rounded-lg"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                    Change Theme 
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOutIcon />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>



            </div>
          </div>

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
