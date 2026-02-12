import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createUserSchema,
  type CreateUserFormData,
} from "@/features/admin/schemas/createUser.schema"
import { useTenants } from "@/features/admin/hooks/useTenants"
import { useCreateUser } from "@/features/admin/hooks/useCreateUser"

interface CreateUserFormProps {
  onSuccess?: () => void
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps = {}) {
  const { data: tenants = [], isPending: tenantsLoading } = useTenants()
  const mutation = useCreateUser()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  })

  const onSubmit = (data: CreateUserFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success("Usuario creado exitosamente")
        reset()
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Error al crear el usuario")
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Información del usuario</FieldLegend>

          <Field>
            <FieldLabel htmlFor="name">Nombre</FieldLabel>
            <Input
              id="name"
              placeholder="Juan García"
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="juan@empresa.com"
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <PasswordInput
              id="password"
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Permisos y asignación</FieldLegend>

          <Field>
            <FieldLabel htmlFor="role">Rol</FieldLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role" className="w-full">
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
            <FieldLabel htmlFor="tenantId">Tenant</FieldLabel>
            <Controller
              name="tenantId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={tenantsLoading}
                >
                  <SelectTrigger id="tenantId" className="w-full">
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
              : "Error al crear el usuario"}
          </p>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creando..." : "Crear usuario"}
        </Button>
      </DialogFooter>
    </form>
  )
}
