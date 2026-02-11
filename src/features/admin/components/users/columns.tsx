import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { authClient } from "@/lib/auth-client"

type User = typeof authClient.$Infer.Session.user

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue<string | undefined>("role")
      return role ? (
        <Badge variant="secondary" className="capitalize">
          {role}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      )
    },
  },
  {
    accessorKey: "banned",
    header: "Estado",
    cell: ({ row }) => {
      const banned = row.getValue<boolean | null | undefined>("banned")
      return banned ? (
        <Badge variant="destructive">Suspendido</Badge>
      ) : (
        <Badge variant="outline" className="text-green-600 border-green-600">
          Activo
        </Badge>
      )
    },
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
