import { type Dispatch, type SetStateAction } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Avatar } from "@/components/ui/avatar"
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
import { ArrowLeftIcon, EllipsisVerticalIcon, HandIcon, InfoIcon, SearchIcon, ShieldCheckIcon, ShieldOffIcon, UserIcon } from "lucide-react"
import { getAvatarBackgroundColor } from "@/utils/colors"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatLayoutHeaderProps {
  conversationId: string;
  onShowContactDetails: Dispatch<SetStateAction<boolean>>;
  onToggleSearch?: () => void;
  onBack?: () => void;
}

export const ChatLayoutHeader = ({ conversationId, onShowContactDetails, onToggleSearch, onBack }: ChatLayoutHeaderProps) => {
  const conversation = useLiveQuery(
    () => conversationsRepository.getById(conversationId),
    [conversationId],
  )

  const customer = useLiveCustomer(conversation?.customerId)
  const dismissAgent = useDismissAgent(conversationId)

  const displayName = customer?.name ?? conversation?.customerId ?? ""
  const isRequestingAgent = conversation?.requestingAgent ?? false

  return (
    <div className="flex items-center px-4 py-1 w-full h-[52px] border-b-1 bg-primary-white dark:bg-muted shadow-sm">
      <div className="flex items-center gap-2 w-full justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button className="p-1 hover:bg-secondary-white rounded-sm" onClick={onBack}>
              <ArrowLeftIcon className="stroke-foreground w-5 h-5" />
            </button>
          )}
          <Avatar className={`${getAvatarBackgroundColor(conversation?.customerId ?? conversationId)} flex justify-center items-center w-10 h-10`}>
            <UserIcon className="text-white" />
          </Avatar>
          <span className="text-foreground font-medium">{displayName}</span>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="cursor-pointer p-1 hover:bg-secondary-white rounded-sm"
                onClick={() => onToggleSearch?.()}
              >
                <SearchIcon className="stroke-foreground w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Buscar mensaje</p>
            </TooltipContent>
          </Tooltip>
          {isRequestingAgent && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="cursor-pointer p-1 hover:bg-secondary-white rounded-sm"
                  disabled={dismissAgent.isPending}
                  onClick={() => dismissAgent.mutate()}
                >
                  <HandIcon className="stroke-foreground w-5 h-5" />
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
            <InfoIcon className="stroke-foreground w-5 h-5" />
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
          <EllipsisVerticalIcon className="stroke-foreground w-5 h-5" />
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
