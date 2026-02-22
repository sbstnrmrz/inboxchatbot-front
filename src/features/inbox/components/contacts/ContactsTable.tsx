import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useCustomersAdditional } from "@/features/inbox/hooks/useCustomersAdditional"
import { contactsColumns, type ChannelFilter } from "./columns"

const CHANNEL_FILTERS: { label: string; value: ChannelFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Instagram", value: "instagram" },
]

export function ContactsTable() {
  const { data: customers = [], isPending, isError } = useCustomersAdditional()
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all")

  const columnFilters = useMemo(
    () => [{ id: "channels", value: channelFilter }],
    [channelFilter],
  )

  const table = useReactTable({
    data: customers,
    columns: contactsColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
  })

  if (isError) {
    return (
      <p className="text-destructive text-sm">Error al cargar los contactos.</p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Channel filter */}
      <div className="flex gap-2">
        {CHANNEL_FILTERS.map(({ label, value }) => (
          <Button
            key={value}
            variant={channelFilter === value ? "default" : "outline"}
            size="sm"
            onClick={() => setChannelFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border text-black">
        <Table>
          <TableHeader>
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
                <TableCell
                  colSpan={contactsColumns.length}
                  className="text-center "
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={contactsColumns.length}
                  className="text-center "
                >
                  No hay contactos.
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
    </div>
  )
}
