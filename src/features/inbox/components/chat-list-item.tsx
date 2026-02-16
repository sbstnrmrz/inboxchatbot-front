import { useLiveQuery } from "dexie-react-hooks";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CachedConversation, CachedMessage } from "@/lib/db";
import { messagesRepository } from "@/lib/db/repositories/messages.repository";

interface ChatListItemProps {
  conversation: CachedConversation;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ChatListItem({ conversation, isSelected, onClick }: ChatListItemProps) {
  const { lastMessageId, unreadCount, channel } = conversation;

  const lastMessage = useLiveQuery(
    () =>
      lastMessageId
        ? messagesRepository.getById(lastMessageId)
        : Promise.resolve(undefined),
    [lastMessageId],
  );

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer w-full p-2 rounded-lg hover:bg-secondary-white ${isSelected ? "bg-secondary-white" : "bg-white shadow-sm"}`}
    >
      <div className="flex gap-2 items-center">
        <Avatar className="w-12 h-12">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="w-full min-w-0 flex flex-col">
          <ChatItemHeader
            customerName={conversation.customerId}
            lastMessageAt={conversation.lastMessageAt}
          />
          <ChatItemLastMessage
            message={lastMessage}
            preview={conversation.lastMessagePreview}
            channel={channel}
            unreadCount={unreadCount}
          />
        </div>
      </div>
    </div>
  );
}

function ChatItemHeader({
  customerName,
  lastMessageAt,
}: {
  customerName: string;
  lastMessageAt?: Date;
}) {
  const formatted = lastMessageAt
    ? new Intl.DateTimeFormat("es-VE", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(lastMessageAt)
    : "";

  return (
    <div className="w-full flex justify-between gap-2">
      <span className="font-semibold truncate">{customerName}</span>
      <span className="text-xs text-gray-500 text-nowrap">{formatted}</span>
    </div>
  );
}

function ChatItemLastMessage({
  message,
  preview,
  channel,
  unreadCount,
}: {
  message: CachedMessage | undefined;
  preview?: string;
  channel: string;
  unreadCount: number;
}) {
  const text = message?.body ?? preview ?? "";

  const ChannelIcon =
    channel === "INSTAGRAM" ? (
      <InstagramIcon className="w-4 h-4 shrink-0 text-gray-400" />
    ) : (
      <WhatsappIcon className="w-4 h-4 shrink-0 text-gray-400" />
    );

  return (
    <div className="flex w-full items-center justify-between gap-1">
      <div className="flex items-center gap-1 min-w-0">
        {ChannelIcon}
        <span className="text-sm text-gray-500 truncate">{text}</span>
      </div>
      {unreadCount > 0 && (
        <span className="shrink-0 bg-green-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}
