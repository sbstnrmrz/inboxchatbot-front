import { type ColumnDef } from "@tanstack/react-table"
import { type Tenant } from "@/features/admin/api/tenants.api"

export const tenantsColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
        {row.getValue("slug")}
      </code>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>("createdAt"))
      return <span>{date.toLocaleDateString("es-MX")}</span>
    },
  },
]
