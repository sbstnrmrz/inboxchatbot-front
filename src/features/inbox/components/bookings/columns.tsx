import type { ColumnDef } from "@tanstack/react-table"
import type { BookingWithCustomer, BookingStatus } from "@/types/booking.type"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUpdateBookingStatus } from "@/features/inbox/hooks/useUpdateBookingStatus"
import { ChevronDown } from "lucide-react"

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  DONE: "Completado",
  CANCELED: "Cancelado",
}

const STATUS_CLASS: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  DONE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELED: "bg-muted text-muted-foreground",
}

const ALL_STATUSES: BookingStatus[] = ["PENDING", "DONE", "CANCELED"]

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso))
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

function StatusCell({ booking }: { booking: BookingWithCustomer }) {
  const { mutate, isPending } = useUpdateBookingStatus()
  const status = booking.status

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer ${STATUS_CLASS[status]}`}
      >
        {STATUS_LABEL[status]}
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {ALL_STATUSES.filter((s) => s !== status).map((s) => (
          <DropdownMenuItem
            key={s}
            onSelect={() => mutate({ id: booking._id, status: s })}
          >
            {STATUS_LABEL[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const bookingsColumns: ColumnDef<BookingWithCustomer>[] = [
  {
    accessorKey: "customerName",
    header: "Cliente",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.customerName || row.original.customerId}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <StatusCell booking={row.original} />,
  },
  {
    accessorKey: "startDate",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{formatDate(row.original.startDate)}</span>
    ),
  },
  {
    id: "startTime",
    header: "Hora",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{formatTime(row.original.startDate)}</span>
    ),
  },
]
