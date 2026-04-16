import {
  flexRender,
  getCoreRowModel,
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
import { useUsers } from "@/features/admin/hooks/useUsers"
import { usersColumns } from "./columns"

export function UsersTable() {
  const { data: users = [], isPending, isError } = useUsers()

  const table = useReactTable({
    data: users,
    columns: usersColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isError) {
    return (
      <p className="text-destructive text-sm">Error al cargar los usuarios.</p>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table className="bg-white dark:bg-card">
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
              <TableCell colSpan={usersColumns.length} className="text-center text-muted-foreground">
                Cargando...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={usersColumns.length} className="text-center text-muted-foreground">
                No hay usuarios registrados.
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
  )
}
