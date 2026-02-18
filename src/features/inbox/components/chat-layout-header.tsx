import { useLiveQuery } from "dexie-react-hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import { useLiveCustomer } from "@/features/inbox/hooks/useLiveCustomer"

interface ChatLayoutHeaderProps {
  conversationId: string;
}

export const ChatLayoutHeader = ({ conversationId }: ChatLayoutHeaderProps) => {
  const conversation = useLiveQuery(
    () => conversationsRepository.getById(conversationId),
    [conversationId],
  )

  const customer = useLiveCustomer(conversation?.customerId)

  const displayName = customer?.name ?? conversation?.customerId ?? ""

  return (
    <div className="flex items-center px-4 py-1 w-full h-[52px] border-b-1 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <Avatar className="w-10 h-10">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-black font-medium">{displayName}</span>
      </div>
    </div>
  )
}

