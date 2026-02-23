import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table"
import { ArrowUpDown, SquareArrowOutUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { CustomerAdditionalDetails } from "@/features/inbox/api/customers-additional.queries"
import { WhatsappIcon } from "@/components/icons/WhatsappIcon"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import parsePhoneNumber from 'libphonenumber-js'
import { useNavigate, Link } from "@tanstack/react-router"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type ChannelFilter = "all" | "whatsapp" | "instagram"

// Stable module-level reference — never recreated on render.
const channelFilterFn: FilterFn<CustomerAdditionalDetails> = (
  row: Row<CustomerAdditionalDetails>,
  _columnId: string,
  filterValue: ChannelFilter,
) => {
  if (filterValue === "all") return true
  if (filterValue === "whatsapp") return Boolean(row.original.whatsappInfo)
  if (filterValue === "instagram") return Boolean(row.original.instagramInfo)
  return true
}

function ChannelBadges({ customer }: { customer: CustomerAdditionalDetails }) {
  return (
    <div className="flex gap-1.5">
      {customer.whatsappInfo && (
        <div className="flex items-center gap-1">
          <WhatsappIcon className="w-4 h-4"/>
          <span>WhatsApp</span>
        </div>
      )}
      {customer.instagramInfo && (
        <div className="flex items-center gap-1">
          <InstagramIcon className="w-4 h-4"/>
          <span>Instagram</span>
        </div>
      )}
      {!customer.whatsappInfo && !customer.instagramInfo && (
        <span className="text-muted-foreground text-xs">—</span>
      )}
    </div>
  )
}

// Static array — module-level so the reference never changes between renders.
export const contactsColumns: ColumnDef<CustomerAdditionalDetails>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    id: "channels",
    header: "Canales",
    cell: ({ row }) => <ChannelBadges customer={row.original} />,
    filterFn: channelFilterFn,
    enableSorting: false,
  },
  {
    id: "phone",
    header: "Teléfono",
    cell: ({ row }) => row.original.whatsappInfo?.id 
      ? getFlagEmoji(parsePhoneNumber('+' + row.original.whatsappInfo.id)?.country as string) + ' ' +  parsePhoneNumber('+' + row.original.whatsappInfo.id)?.formatInternational() 
      : '-',
    enableSorting: false,
  },
  {
    id: "username",
    header: "Usuario",
    cell: ({ row }) => 
      row.original.instagramInfo?.username 
        ? 
        <a target="_blank" className="underline text-blue-400" href={`https://www.instagram.com/${row.original.instagramInfo?.username}`}>
          @{row.original.instagramInfo?.username}
        </a> 
        : '-',
    enableSorting: false,
  },
  {
    accessorKey: "messageCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Mensajes
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue<number>("messageCount")}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <>
              <GoToConversationButton conversationId={row.original.conversationId}/>
            </>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Ir a la conversacion</p>
          </TooltipContent>
        </Tooltip>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => 
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
}

function GoToConversationButton({conversationId}: {conversationId: string}) {
  const navigate = useNavigate();
  return (
    <button
      className="flex items-center cursor-pointer hover:bg-secondary-white p-1 rounded-sm"
      onClick={() => {
        navigate({
          to: '/inbox',
          search: {
            conversationId: conversationId
          }
        })
      }}
    >
      <SquareArrowOutUpRight className="w-4 h-4"/>
    </button>
  )
}
