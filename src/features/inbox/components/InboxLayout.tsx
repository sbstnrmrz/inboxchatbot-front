import { useState, useMemo } from 'react';
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


export function InboxLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);

  return (
    <>
      {/* Vista móvil - solo lista O chat */}

      {/* Vista desktop - sidebar + chat */}
      <SidebarProvider defaultOpen={true}>
        <div className="hidden md:flex h-screen w-screen overflow-hidden">
          <Sidebar collapsible="icon" className="flex border-r">
            <SidebarHeader className='bg-primary-white border-b border-secondary-white h-[52px] justify-center'>
              <div className='flex'>
                <div className="flex items-center justify-between">
                  <UserOptionsDropdown/>
                </div>
                <div className="flex w-full items-center justify-center">
                  <h1 className=" text-lg font-semibold group-data-[collapsible=icon]:hidden">Chats</h1>
                </div>
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
          </Sidebar>

          <SidebarInset>
          </SidebarInset>
        </div>
      </SidebarProvider>

    </>
  );
}

