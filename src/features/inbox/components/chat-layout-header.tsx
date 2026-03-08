import { type Dispatch, type SetStateAction } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { conversationsRepository } from "@/lib/db/repositories/conversations.repository"
import { useLiveCustomer } from "@/features/inbox/hooks/useLiveCustomer"
import { useBlockCustomer } from "@/features/inbox/hooks/useBlockCustomer"
import { useDismissAgent } from "@/features/inbox/hooks/useDismissAgent"
import type { CachedCustomer } from "@/lib/db"
import { EllipsisVerticalIcon, HandIcon, InfoIcon, ShieldCheckIcon, ShieldOffIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatLayoutHeaderProps {
  conversationId: string;
  onShowContactDetails: Dispatch<SetStateAction<boolean>>;
}

export const ChatLayoutHeader = ({ conversationId, onShowContactDetails }: ChatLayoutHeaderProps) => {
  const conversation = useLiveQuery(
    () => conversationsRepository.getById(conversationId),
    [conversationId],
  )

  const customer = useLiveCustomer(conversation?.customerId)
  const dismissAgent = useDismissAgent(conversationId)

  const displayName = customer?.name ?? conversation?.customerId ?? ""
  const isRequestingAgent = conversation?.requestingAgent ?? false

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
          {isRequestingAgent && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="cursor-pointer p-1 hover:bg-secondary-white rounded-sm"
                  disabled={dismissAgent.isPending}
                  onClick={() => dismissAgent.mutate()}
                >
                  <HandIcon className="stroke-black w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Marcar como atendido</p>
              </TooltipContent>
            </Tooltip>
          )}
          <button
            className="p-1 hover:bg-secondary-white rounded-sm"
            onClick={() => onShowContactDetails(prev => !prev)}
          >
            <InfoIcon className="stroke-black w-5 h-5" />
          </button>
          <ChatOptionsDropdown customer={customer} />
        </div>
      </div>
    </div>
  )
}

function ChatOptionsDropdown({ customer }: { customer: CachedCustomer | undefined }) {
  const { block, unblock } = useBlockCustomer()
  const isBlocked = customer?.isBlocked ?? false
  const isPending = block.isPending || unblock.isPending

  const handleToggleBlock = () => {
    if (!customer) return
    if (isBlocked) {
      unblock.mutate(customer.id)
    } else {
      block.mutate(customer.id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 hover:bg-secondary-white rounded-sm">
          <EllipsisVerticalIcon className="stroke-black w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          disabled={!customer || isPending}
          onSelect={handleToggleBlock}
        >
          {isBlocked
            ? <><ShieldCheckIcon className="w-4 h-4" /> Desbloquear contacto</>
            : <><ShieldOffIcon className="w-4 h-4" /> Bloquear contacto</>
          }
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
