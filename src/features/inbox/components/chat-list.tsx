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

  // Keep latest values accessible inside the observer callback without
  // recreating the observer on every render.
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingRef = useRef(isFetchingNextPage);
  const fetchNextPageRef = useRef(fetchNextPage);
  hasNextPageRef.current = hasNextPage;
  isFetchingRef.current = isFetchingNextPage;
  fetchNextPageRef.current = fetchNextPage;

  // The scrollable list container — used as the IntersectionObserver root
  // so the observer measures visibility relative to this div, not the document viewport.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = scrollContainerRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingRef.current
        ) {
          fetchNextPageRef.current?.();
        }
      },
      // root = the scrollable div; sentinel is measured relative to it
      { root: sentinel, threshold: 0 },
    );

    const sentinelEl = sentinelRef.current;
    if (sentinelEl) observer.observe(sentinelEl);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div ref={scrollContainerRef} className='flex flex-col w-full h-full p-2 overflow-y-auto gap-2'>
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
