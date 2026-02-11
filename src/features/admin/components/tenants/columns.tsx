import { useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditTenantModal } from "./EditTenantModal"
import type { Tenant } from "@/types/tenant.type"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

function ActionsCell({ tenant }: { tenant: Tenant }) {
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
            aria-label="Editar tenant"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Editar Tenant</p>
        </TooltipContent>
      </Tooltip>
      <EditTenantModal
        tenant={tenant}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell tenant={row.original} />,
  },
]
