import { useEffect, useMemo, useRef, useState } from 'react';
import type { FetchNextPageOptions } from '@tanstack/react-query';
import { ChatListItem } from './chat-list-item';
import { Spinner } from '@/components/ui/spinner';
import { useLiveConversations } from '../hooks/useLiveConversations';
import { logger } from '@/lib/logger';
import type { ConversationChannel } from '@/types/conversation.type';
import { ChannelFilters } from './ChannelFilters';

interface ChatListProps {
  onChatSelected: (conversationId: string) => void;
  selectedConversationId?: string | null;
  hasNextPage?: boolean;
  fetchNextPage?: (options?: FetchNextPageOptions) => void;
  isFetchingNextPage?: boolean;
}

type ChannelFilterValue = ConversationChannel | "ALL";


export const ChatList = ({
  onChatSelected,
  selectedConversationId,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: ChatListProps) => {
  const { conversations, isLoading } = useLiveConversations();
  const [channelFilter, setChannelFilter] = useState<ChannelFilterValue>("ALL");

  // Sentinel element at the bottom — triggers next page load when visible
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !fetchNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // Filter by channel
    if (channelFilter !== "ALL") {
      filtered = filtered.filter(conv => conv.channel === channelFilter);
    }
    
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
            ? (
              <>
                {filteredConversations.map((conv) => (
                  <ChatListItem 
                    key={conv.id}
                    conversation={conv}
                    isSelected={selectedConversationId === conv.id}
                    onClick={onChatSelected}
                  />
                ))}

                {/* Sentinel — watched by IntersectionObserver to load next page */}
                <div ref={sentinelRef} className="h-1 shrink-0" />

                {isFetchingNextPage && (
                  <div className="flex justify-center py-2">
                    <Spinner className="size-5" />
                  </div>
                )}
              </>
            )
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
