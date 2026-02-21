import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import { useLiveCustomer } from "@/features/inbox/hooks/useLiveCustomer"
import { EllipsisVerticalIcon, InfoIcon, ShieldOffIcon } from "lucide-react"
import { CustomerInfo } from "@/features/inbox/components/customer-info"

interface ChatLayoutHeaderProps {
  conversationId: string;
}

export const ChatLayoutHeader = ({ conversationId }: ChatLayoutHeaderProps) => {
  const [customerInfoOpen, setCustomerInfoOpen] = useState(false)

  const conversation = useLiveQuery(
    () => conversationsRepository.getById(conversationId),
    [conversationId],
  )

  const customer = useLiveCustomer(conversation?.customerId)

  const displayName = customer?.name ?? conversation?.customerId ?? ""

  return (
    <div className="flex items-center px-4 py-1 w-full h-[52px] border-b-1 bg-white shadow-sm">
      <div className="flex items-center gap-2 w-full justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-black font-medium">{displayName}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCustomerInfoOpen(true)}
          >
            <InfoIcon className="stroke-black w-8 h-8" />
          </Button>
          <ChatOptionsDropdown/>
        </div>
      </div>

      {customer && (
        <CustomerInfo
          customer={customer}
          open={customerInfoOpen}
          onOpenChange={setCustomerInfoOpen}
        />
      )}
    </div>
  )
}

function ChatOptionsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVerticalIcon className="stroke-black w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => {/* TODO: block customer */}}
        >
          <ShieldOffIcon className="w-4 h-4" />
          Bloquear contacto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

