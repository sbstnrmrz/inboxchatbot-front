import { useEffect, useMemo, useState } from 'react';
import type { FetchNextPageOptions } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ChatListItem } from './chat-list-item';
import { Spinner } from '@/components/ui/spinner';
import { useLiveConversations } from '../hooks/useLiveConversations';
import { logger } from '@/lib/logger';
import type { ConversationChannel } from '@/types/conversation.type';
import { ChannelFilters } from './ChannelFilters';
import { TagsManagerModal } from './tags-manager-modal';

const SCROLL_CONTAINER_ID = 'chat-list-scroll';

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

  const filteredConversations = useMemo(() => {
    if (channelFilter === "ALL") return conversations;
    return conversations.filter(conv => conv.channel === channelFilter);
  }, [conversations, channelFilter]);

  useEffect(() => {
    logger.debug('cached conversations', conversations);
  }, [conversations]);

  // If the loaded items don't overflow the container yet but there are more
  // pages available, keep fetching until the list is scrollable.
  // This handles screens where PAGE_SIZE fits without generating a scrollbar.
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return;
    const el = document.getElementById(SCROLL_CONTAINER_ID);
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight) {
      fetchNextPage?.();
    }
  }, [filteredConversations.length, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  return (
    <>
      <div className="flex items-center px-4 py-2 bg-primary-white border-b border-secondary-white group-data-[collapsible=icon]:hidden">
        <span className='text-sm mr-2'>Filtrar por</span>
        <ChannelFilters value={channelFilter} onValueChange={setChannelFilter} />
        <div className="ml-auto">
          <TagsManagerModal />
        </div>
      </div>

      <div
        id={SCROLL_CONTAINER_ID}
        className='flex flex-col w-full h-full p-2 overflow-y-auto gap-2'
      >
        {isLoading ? (
          <ChatLoading />
        ) : filteredConversations.length === 0 ? (
          <EmptyConversations />
        ) : (
          <InfiniteScroll
            dataLength={filteredConversations.length}
            next={() => fetchNextPage?.()}
            hasMore={hasNextPage ?? false}
            loader={
              <div className="flex justify-center py-2">
                <Spinner className="size-5" />
              </div>
            }
            scrollableTarget={SCROLL_CONTAINER_ID}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'visible' }}
          >
            {filteredConversations.map((conv) => (
              <ChatListItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversationId === conv.id}
                onClick={onChatSelected}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </>
  );
};

function ChatLoading() {
  return (
    <div className='flex flex-col gap-2 h-full my-auto items-center justify-center text-gray-500'>
      <Spinner className='size-16' />
      <span>Cargando chats</span>
    </div>
  );
}

function EmptyConversations() {
  return (
    <div className='flex flex-col gap-2 h-full my-auto items-center justify-center text-gray-500'>
      <span>No existen conversaciones</span>
    </div>
  );
}
