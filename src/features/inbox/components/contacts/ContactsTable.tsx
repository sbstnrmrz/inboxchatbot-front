import { useState, useEffect } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
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
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCustomersAdditional } from "@/features/inbox/hooks/useCustomersAdditional"
import { contactsColumns, type ChannelFilter } from "./columns"

const PAGE_SIZE = 20

export function ContactsTable() {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isPending, isError } = useCustomersAdditional({
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const customers = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all")

  const table = useReactTable({
    data: customers,
    columns: contactsColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  function handleChannelFilter(value: ChannelFilter) {
    setChannelFilter(value)
    table.getColumn("channels")?.setFilterValue(value === "all" ? undefined : value)
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">Error al cargar los contactos.</p>
    )
  }

  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 py-4">
        {/* Text search */}
        <Input
          placeholder="Buscar contacto..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="bg-white dark:bg-card max-w-sm"
        />

        {/* Channel filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-white dark:bg-card" variant="outline">
              Canal <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={channelFilter === "all"}
              onCheckedChange={() => handleChannelFilter("all")}
            >
              Todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={channelFilter === "whatsapp"}
              onCheckedChange={() => handleChannelFilter("whatsapp")}
            >
              WhatsApp
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={channelFilter === "instagram"}
              onCheckedChange={() => handleChannelFilter("instagram")}
            >
              Instagram
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white dark:bg-card ml-auto">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id === "name" ? "Nombre"
                    : col.id === "channels" ? "Canales"
                    : col.id === "tags" ? "Etiquetas"
                    : col.id === "messageCount" ? "Mensajes"
                    : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="w-full rounded-md border flex-1 overflow-auto min-h-0 ">
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
                <TableCell colSpan={contactsColumns.length} className="h-24 text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={contactsColumns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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

      {/* Footer: selection count + pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {data?.total ?? 0} fila(s) seleccionada(s).
        </div> */}
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
