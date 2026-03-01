import { useLiveQuery } from "dexie-react-hooks";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CachedConversation, CachedMessage } from "@/lib/db";
import { messagesRepository } from "@/lib/db/repositories/messages.repository";
import { useLiveCustomer } from "@/features/inbox/hooks/useLiveCustomer";
import type { MessageType } from "@/types/message.type";
import { MicIcon, ImageIcon, VideoIcon, FileIcon, MapPinIcon, SmileIcon } from "lucide-react";

interface ChatListItemProps {
  conversation: CachedConversation;
  isSelected?: boolean;
  onClick: (conversationId: string) => void;
}

export function ChatListItem({ conversation, isSelected, onClick }: ChatListItemProps) {
  const {id, customerId, lastMessageId, unreadCount, channel } = conversation;

  const customer = useLiveCustomer(customerId);

  const lastMessage = useLiveQuery(
    () =>
      lastMessageId
        ? messagesRepository.getById(lastMessageId)
        : Promise.resolve(undefined),
    [lastMessageId],
  );

  return (
    <div
      onClick={() => {
        onClick(id)
      }}
      className={`cursor-pointer w-full p-2 rounded-lg hover:bg-secondary-white ${isSelected ? "bg-secondary-white" : "bg-white shadow-sm"}`}
    >
      <div className="flex gap-2 items-center">
        <Avatar className="w-12 h-12">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="w-full min-w-0 flex flex-col justify-center">
          <ChatItemHeader
            customerName={customer?.name ?? customerId}
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

function formatMessageDate(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
  const startOfWeek = new Date(startOfToday.getTime() - (now.getDay() || 7) * 86_400_000);

  if (date >= startOfToday) {
    return new Intl.DateTimeFormat("es-VE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  if (date >= startOfYesterday) {
    return "Ayer";
  }

  if (date >= startOfWeek) {
    return new Intl.DateTimeFormat("es-VE", { weekday: "short" }).format(date);
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function ChatItemHeader({
  customerName,
  lastMessageAt,
}: {
  customerName: string;
  lastMessageAt?: Date;
}) {
  const formatted = lastMessageAt
    ? formatMessageDate(lastMessageAt)
    : "";

  return (
    <div className="w-full flex justify-between gap-2 items-center">
      <span className="font-semibold truncate">{customerName}</span>
      <span className="text-xs text-gray-500 text-nowrap">{formatted}</span>
    </div>
  );
}

const MESSAGE_TYPE_LABEL: Partial<Record<MessageType, { label: string; icon: React.ReactNode }>> = {
  AUDIO:    { label: "Audio",     icon: <MicIcon className="w-4 h-4" /> },
  IMAGE:    { label: "Imagen",    icon: <ImageIcon className="w-4 h-4" /> },
  VIDEO:    { label: "Video",     icon: <VideoIcon className="w-4 h-4" /> },
  DOCUMENT: { label: "Documento", icon: <FileIcon className="w-4 h-4" /> },
  STICKER:  { label: "Sticker",   icon: <SmileIcon className="w-4 h-4" /> },
  LOCATION: { label: "Ubicación", icon: <MapPinIcon className="w-4 h-4" /> },
};

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
  const mediaLabel = message?.messageType ? MESSAGE_TYPE_LABEL[message.messageType] : undefined;
  const text = message?.body || (!mediaLabel ? (preview ?? "") : "");

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
        {mediaLabel && !message?.body ? (
          <span className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
            {mediaLabel.icon}
            {mediaLabel.label}
          </span>
        ) : (
          <span className="text-sm text-gray-500 truncate">{text}</span>
        )}
      </div>
      {unreadCount > 0 && (
        <span className="shrink-0 bg-green-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}
