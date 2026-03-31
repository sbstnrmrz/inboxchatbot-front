import { useEffect, useMemo, useState } from 'react';
import type { FetchNextPageOptions } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ChatListItem } from './chat-list-item';
import { Spinner } from '@/components/ui/spinner';
import { useLiveConversations } from '../hooks/useLiveConversations';
import { useConversationSearch } from '../hooks/useConversationSearch';
import { useDebounce } from '@/hooks/use-debounce';
import { logger } from '@/lib/logger';
import type { ConversationChannel } from '@/types/conversation.type';
import { ChannelFilters } from './ChannelFilters';
import { TagFilters } from './TagFilters';
import { TagsManagerModal } from './tags-manager-modal';

const SCROLL_CONTAINER_ID = 'chat-list-scroll';

interface ChatListProps {
  onChatSelected: (conversationId: string) => void;
  selectedConversationId?: string | null;
  hasNextPage?: boolean;
  fetchNextPage?: (options?: FetchNextPageOptions) => void;
  isFetchingNextPage?: boolean;
  searchQuery?: string;
}

type ChannelFilterValue = ConversationChannel | "ALL";

export const ChatList = ({
  onChatSelected,
  selectedConversationId,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  searchQuery = "",
}: ChatListProps) => {
  const debouncedSearch = useDebounce(searchQuery);
  const isSearchActive = debouncedSearch.trim().length > 0;

  const { conversations, isLoading: isLiveLoading } = useLiveConversations();
  const { data: searchResults, isPending: isSearchPending } = useConversationSearch(debouncedSearch);

  const isLoading = isSearchActive ? isSearchPending && !searchResults : isLiveLoading;
  const baseConversations = isSearchActive ? (searchResults ?? []) : conversations;

  const [channelFilter, setChannelFilter] = useState<ChannelFilterValue>("ALL");
  const [tagFilter, setTagFilter] = useState<string>("ALL");

  const filteredConversations = useMemo(() => {
    let result = baseConversations;
    if (channelFilter !== "ALL") {
      result = result.filter(conv => conv.channel === channelFilter);
    }
    if (tagFilter !== "ALL") {
      result = result.filter(conv => conv.tags?.includes(tagFilter));
    }
    return result;
  }, [baseConversations, channelFilter, tagFilter]);

  useEffect(() => {
    logger.debug('cached conversations', conversations);
  }, [conversations]);

  // If the loaded items don't overflow the container yet but there are more
  // pages available, keep fetching until the list is scrollable.
  // This handles screens where PAGE_SIZE fits without generating a scrollbar.
  useEffect(() => {
    if (isSearchActive || !hasNextPage || isFetchingNextPage || isLoading) return;
    const el = document.getElementById(SCROLL_CONTAINER_ID);
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight) {
      fetchNextPage?.();
    }
  }, [isSearchActive, filteredConversations.length, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  return (
    <>
      <div 
        className="flex items-center gap-1 px-2 py-3 bg-primary-white border-b border-secondary-white group-data-[collapsible=icon]:hidden
        overflow-x-auto overflow-y-hidden"
      >
        <TagsManagerModal />
        <TagFilters value={tagFilter} onValueChange={setTagFilter} />
        <ChannelFilters value={channelFilter} onValueChange={setChannelFilter} />
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
            hasMore={!isSearchActive && (hasNextPage ?? false)}
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
    <div className='flex flex-col gap-2 h-full my-auto items-center justify-center text-gray-500 dark:text-gray-400'>
      <Spinner className='size-16' />
      <span>Cargando chats</span>
    </div>
  );
}

function EmptyConversations() {
  return (
    <div className='flex flex-col gap-2 h-full my-auto items-center justify-center text-gray-500 dark:text-gray-400'>
      <span>No existen conversaciones</span>
    </div>
  );
}
