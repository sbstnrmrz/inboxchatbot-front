import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBookings } from "@/features/inbox/hooks/useBookings"
import { bookingsColumns } from "./columns"
import type { BookingStatus } from "@/types/booking.type"

type StatusFilter = BookingStatus | "all"

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendiente", value: "PENDING" },
  { label: "Completado", value: "DONE" },
  { label: "Cancelado", value: "CANCELED" },
]

const PAGE_SIZE = 20

export function BookingsTable() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isPending, isError } = useBookings({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
  })

  const bookings = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const table = useReactTable({
    data: bookings,
    columns: bookingsColumns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    state: { sorting },
  })

  function handleStatusFilter(value: StatusFilter) {
    setStatusFilter(value)
    setPage(1)
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">Error al cargar los agendamientos.</p>
    )
  }

  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-white dark:bg-card" variant="outline">
              {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "Estado"}{" "}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={statusFilter === opt.value}
                onCheckedChange={() => handleStatusFilter(opt.value)}
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="w-full rounded-md border flex-1 overflow-auto min-h-0">
        <Table className="w-full bg-white dark:bg-card">
          <TableHeader className="bg-white dark:bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={bookingsColumns.length} className="h-24 text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={bookingsColumns.length} className="h-24 text-center">
                  No hay agendamientos.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">
            Página {page} de {totalPages}
          </span>
          <div className="space-x-2">
            <Button
              className="bg-white dark:bg-card"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              className="bg-white dark:bg-card"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
