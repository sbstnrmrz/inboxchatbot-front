import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const SCROLL_THRESHOLD_PX = 100;

export const ChatList = ({
  onChatSelected,
  selectedConversationId,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: ChatListProps) => {
  const { conversations, isLoading } = useLiveConversations();
  const [channelFilter, setChannelFilter] = useState<ChannelFilterValue>("ALL");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Keep latest values in refs so the scroll handler never goes stale
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingRef = useRef(isFetchingNextPage);
  const fetchNextPageRef = useRef(fetchNextPage);
  hasNextPageRef.current = hasNextPage;
  isFetchingRef.current = isFetchingNextPage;
  fetchNextPageRef.current = fetchNextPage;

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    if (
      distanceFromBottom < SCROLL_THRESHOLD_PX &&
      hasNextPageRef.current &&
      !isFetchingRef.current
    ) {
      fetchNextPageRef.current?.();
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
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
