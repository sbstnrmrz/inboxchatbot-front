
import { useState } from 'react';
import { BotIcon, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ChatWindowProps {
}

export function ChatWindow() {
  const [isTogglingBot, setIsTogglingBot] = useState(false);

  const handleToggleBotStatus = async () => {

    try {
      setIsTogglingBot(true);

      // Call API to toggle bot status

      // Update conversation in React Query cache
    } catch (error) {
      console.error('❌ Error toggling bot status:', error);
      // You could add a toast notification here
    } finally {
      setIsTogglingBot(false);
    }
  };

    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-[#f8f9fa] border-l border-gray-300">
        <div className="text-center px-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center">
            <span className="text-6xl">💬</span>
          </div>
          <h2 className="text-2xl font-light text-gray-800 mb-2">Inbox Chatbot</h2>
          <p className="text-sm text-gray-600 max-w-md">
            Selecciona un chat de la lista para comenzar a conversar
          </p>
        </div>
      </div>
    );
}
