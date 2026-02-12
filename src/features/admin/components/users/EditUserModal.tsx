import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  editUserSchema,
  type EditUserFormData,
} from "@/features/admin/schemas/editUser.schema"
import { useTenants } from "@/features/admin/hooks/useTenants"
import { useUpdateUser } from "@/features/admin/hooks/useUpdateUser"
import type { authClient } from "@/lib/auth-client"

type User = typeof authClient.$Infer.Session.user & Record<string, unknown>

interface EditUserModalProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserModal({ user, open, onOpenChange }: EditUserModalProps) {
  const { data: tenants = [], isPending: tenantsLoading } = useTenants()
  const mutation = useUpdateUser()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
      role: (user.role as "user" | "admin") ?? "user",
      tenantId: (user.tenantId as string) ?? "",
    },
  })

  const onSubmit = (data: EditUserFormData) => {
    mutation.mutate(
      { id: user.id, data },
      {
        onSuccess: () => {
          toast.success("Usuario actualizado")
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Error al actualizar el usuario"
          )
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Información del usuario</FieldLegend>

              <Field>
                <FieldLabel htmlFor="edit-name">Nombre</FieldLabel>
                <Input
                  id="edit-name"
                  placeholder="Juan García"
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="juan@empresa.com"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Permisos y asignación</FieldLegend>

              <Field>
                <FieldLabel htmlFor="edit-role">Rol</FieldLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="edit-role" className="w-full">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.role]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-tenantId">Tenant</FieldLabel>
                <Controller
                  name="tenantId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={tenantsLoading}
                    >
                      <SelectTrigger id="edit-tenantId" className="w-full">
                        <SelectValue
                          placeholder={
                            tenantsLoading ? "Cargando tenants..." : "Selecciona un tenant"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant._id} value={tenant._id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.tenantId]} />
              </Field>
            </FieldSet>
          </FieldGroup>

          <DialogFooter className="mt-6">
            {mutation.isError && (
              <p className="text-destructive text-sm mr-auto">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Error al actualizar el usuario"}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
