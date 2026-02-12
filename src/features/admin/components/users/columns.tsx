import { useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EditUserModal } from "./EditUserModal"
import type { authClient } from "@/lib/auth-client"

type User = typeof authClient.$Infer.Session.user & Record<string, unknown>

function ActionsCell({ user }: { user: User }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Editar usuario"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Editar usuario</p>
        </TooltipContent>
      </Tooltip>
      <EditUserModal user={user} open={open} onOpenChange={setOpen} />
    </>
  )
}

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
    id: "tenantId",
    header: "Tenant ID",
    cell: ({ row }) => {
      const tenantId = (row.original as Record<string, unknown>).tenantId as string | undefined
      return tenantId ? (
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">{tenantId}</code>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      )
    },
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
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
]
