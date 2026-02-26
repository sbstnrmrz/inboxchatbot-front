import { useEffect, useMemo, useState } from 'react';
import { ChatListItem } from './chat-list-item';
import { Spinner } from '@/components/ui/spinner';
import { useLiveConversations } from '../hooks/useLiveConversations';
import { logger } from '@/lib/logger';
import type { ConversationChannel } from '@/types/conversation.type';
import { ChannelFilters } from './ChannelFilters';

interface ChatListProps {
  onChatSelected: (conversationId: string) => void;
  selectedConversationId?: string | null;
}

type ChannelFilterValue = ConversationChannel | "ALL";


export const ChatList = ({onChatSelected, selectedConversationId}: ChatListProps) => {
  const { conversations, isLoading } = useLiveConversations();
  const [channelFilter, setChannelFilter] = useState<ChannelFilterValue>("ALL");

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // Filter by channel
    if (channelFilter !== "ALL") {
      filtered = filtered.filter(conv => conv.channel === channelFilter);
    }
    
//  // Filter by agent request status
//  if (agentRequestFilter === "REQUESTING_AGENT") {
//    filtered = filtered.filter(conv => conv.requestingAgent === true);
//  }
//  
//  // Filter by search query
//  if (searchQuery.trim()) {
//    const query = searchQuery.toLowerCase().trim();
//    filtered = filtered.filter(conv => {
//      // Search in customer name
//      const nameMatch = conv.customer?.name?.toLowerCase().includes(query) || false;
//      
//      // Search in last message content
//      const messageMatch = conv.lastMessage?.content?.toLowerCase().includes(query) || false;
//      
//      // Search in tags
//      const tagsMatch = conv.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
//      
//      return nameMatch || messageMatch || tagsMatch;
//    });
//  }
    
    return filtered;
  }, [conversations, channelFilter]);

  useEffect(() => {
    logger.debug('cached conversations', conversations);
  }, [conversations]);


  return (
    <>
      <div className="flex items-center px-4 py-2 bg-primary-white border-b border-secondary-white group-data-[collapsible=icon]:hidden">
        <span className='text-sm mr-2'>Filtrar por</span>
        <ChannelFilters value={channelFilter} onValueChange={setChannelFilter}/>
      </div>
      <div className='flex flex-col w-full h-full p-2 overflow-y-auto gap-2'>
        {isLoading
          ? <ChatLoading/>
          : filteredConversations.length > 0
            ? filteredConversations.map((conv) => (
                <ChatListItem 
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConversationId === conv.id}
                  onClick={onChatSelected}
                />
              ))
            : <EmptyConversations/>
        }
      </div>
    </>
  )
}

function ChatLoading() {
  return (
    <div className='flex flex-col gap-2 h-full my-auto items-center justify-center text-gray-500'>
      <Spinner className='size-16 ' />
      <span>Cargando chats</span>
    </div>
  )
}

function EmptyConversations() {
  return (
    <div className='flex flex-col gap-2 h-full my-auto items-center justify-center text-gray-500'>
      <span>No existen conversaciones</span>
    </div>
  )
}

