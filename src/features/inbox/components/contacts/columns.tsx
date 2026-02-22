import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { CustomerWithCount } from "@/features/inbox/api/customers-additional.queries"

/**
 * Virtual channel value used for client-side filtering.
 * A customer can have both channels simultaneously.
 */
export type ChannelFilter = "all" | "whatsapp" | "instagram"

// Stable reference — defined outside the column array so it is never recreated.
const channelFilterFn: FilterFn<CustomerWithCount> = (
  row: Row<CustomerWithCount>,
  _columnId: string,
  filterValue: ChannelFilter,
) => {
  if (filterValue === "all") return true
  if (filterValue === "whatsapp") return Boolean(row.original.whatsappInfo)
  if (filterValue === "instagram") return Boolean(row.original.instagramInfo)
  return true
}

function ChannelBadges({ customer }: { customer: CustomerWithCount }) {
  return (
    <div className="flex gap-1.5">
      {customer.whatsappInfo && (
        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
          WhatsApp
        </Badge>
      )}
      {customer.instagramInfo && (
        <Badge variant="outline" className="text-pink-700 border-pink-300 bg-pink-50 text-xs">
          Instagram
        </Badge>
      )}
      {!customer.whatsappInfo && !customer.instagramInfo && (
        <span className="text-muted-foreground text-xs">—</span>
      )}
    </div>
  )
}

// Static array — defined at module level so the reference never changes between renders.
export const contactsColumns: ColumnDef<CustomerWithCount>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    id: "channels",
    header: "Canales",
    cell: ({ row }) => <ChannelBadges customer={row.original} />,
    filterFn: channelFilterFn,
  },
  {
    accessorKey: "messageCount",
    header: "Mensajes",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue<number>("messageCount")}</span>
    ),
  },
]
