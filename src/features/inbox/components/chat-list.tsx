import { useEffect } from 'react';
import { ChatListItem } from './chat-list-item';
import { Spinner } from '@/components/ui/spinner';
import { useLiveConversations } from '../hooks/useLiveConversations';
import { logger } from '@/lib/logger';

interface ChatListProps {
  onChatSelected: (conversationId: string) => void;
}

export const ChatList = ({onChatSelected}: ChatListProps) => {
  const conversations = useLiveConversations();

  useEffect(() => {
    logger.debug('cached conversations', conversations);
  }, [conversations]);


  return (
    <div className='flex flex-col w-full h-full p-2 overflow-y-auto gap-2'>
      {conversations.length > 0 
        ?
        conversations.map((conv) => (
          <ChatListItem 
            key={conv.id}
            conversation={conv}  
            onClick={onChatSelected}
          />
        ))
        :
        <ChatLoading/>
      }
    </div>
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

