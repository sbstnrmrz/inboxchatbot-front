import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import {
  createTenantSchema,
  type CreateTenantFormInput,
  type CreateTenantFormData,
} from "@/features/admin/schemas/createTenant.schema"
import { tenantsApi } from "@/features/admin/api/tenants.api"
import { queryKeys } from "@/lib/query-keys"
import type { Tenant } from "@/types/tenant.type"

interface EditTenantModalProps {
  tenant: Tenant
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTenantModal({ tenant, open, onOpenChange }: EditTenantModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTenantFormInput>({
    resolver: zodResolver(createTenantSchema) as any,
    defaultValues: {
      name: tenant.name,
      slug: tenant.slug,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CreateTenantFormData) =>
      tenantsApi.update({ id: tenant._id, data }),
    onSuccess: () => {
      toast.success("Tenant actualizado")
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all() })
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Error al actualizar el tenant")
    },
  })

  const onSubmit = (data: CreateTenantFormInput) => {
    mutation.mutate(data as unknown as CreateTenantFormData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar tenant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* ── Información general ─────────────────────────────── */}
            <FieldSet>
              <FieldLegend>Información general</FieldLegend>

              <Field>
                <FieldLabel htmlFor="edit-name">Nombre</FieldLabel>
                <Input
                  id="edit-name"
                  placeholder="Acme Corp"
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-slug">Slug</FieldLabel>
                <Input
                  id="edit-slug"
                  placeholder="acme-corp"
                  {...register("slug")}
                />
                {errors.slug ? (
                  <FieldError errors={[errors.slug]} />
                ) : (
                  <FieldDescription>
                    Identificador único en minúsculas, solo letras, números y
                    guiones. Ej: <code>acme-corp</code>
                  </FieldDescription>
                )}
              </Field>
            </FieldSet>

            {/* ── WhatsApp (opcional) ──────────────────────────────── */}
            <FieldSet>
              <FieldLegend>
                WhatsApp{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  (opcional)
                </span>
              </FieldLegend>

              <Field>
                <FieldLabel htmlFor="edit-whatsapp-accessToken">Access Token</FieldLabel>
                <PasswordInput
                  id="edit-whatsapp-accessToken"
                  placeholder="EAAxxxxxxx..."
                  {...register("whatsappInfo.accessToken")}
                />
                <FieldError errors={[errors.whatsappInfo?.accessToken]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-whatsapp-businessId">WhatsApp Business ID</FieldLabel>
                <Input
                  id="edit-whatsapp-businessId"
                  placeholder="123456789"
                  {...register("whatsappInfo.whatsappBusinessId")}
                />
                <FieldError errors={[errors.whatsappInfo?.whatsappBusinessId]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-whatsapp-appSecret">App Secret</FieldLabel>
                <PasswordInput
                  id="edit-whatsapp-appSecret"
                  placeholder="abcdef123456..."
                  {...register("whatsappInfo.appSecret")}
                />
                <FieldError errors={[errors.whatsappInfo?.appSecret]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-whatsapp-phoneNumberId">Phone Number ID</FieldLabel>
                <Input
                  id="edit-whatsapp-phoneNumberId"
                  placeholder="987654321"
                  {...register("whatsappInfo.phoneNumberId")}
                />
                <FieldError errors={[errors.whatsappInfo?.phoneNumberId]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-whatsapp-webhookVerifyToken">
                  Webhook Verify Token{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </FieldLabel>
                <PasswordInput
                  id="edit-whatsapp-webhookVerifyToken"
                  placeholder="mi-token-secreto"
                  {...register("whatsappInfo.webhookVerifyToken")}
                />
                <FieldError errors={[errors.whatsappInfo?.webhookVerifyToken]} />
              </Field>
            </FieldSet>

            {/* ── Instagram (opcional) ─────────────────────────────── */}
            <FieldSet>
              <FieldLegend>
                Instagram{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  (opcional)
                </span>
              </FieldLegend>

              <Field>
                <FieldLabel htmlFor="edit-instagram-accessToken">Access Token</FieldLabel>
                <PasswordInput
                  id="edit-instagram-accessToken"
                  placeholder="IGAAxxxxxxx..."
                  {...register("instagramInfo.accessToken")}
                />
                <FieldError errors={[errors.instagramInfo?.accessToken]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-instagram-pageId">Page ID</FieldLabel>
                <Input
                  id="edit-instagram-pageId"
                  placeholder="123456789"
                  {...register("instagramInfo.pageId")}
                />
                <FieldError errors={[errors.instagramInfo?.pageId]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-instagram-accountId">Account ID</FieldLabel>
                <Input
                  id="edit-instagram-accountId"
                  placeholder="987654321"
                  {...register("instagramInfo.accountId")}
                />
                <FieldError errors={[errors.instagramInfo?.accountId]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-instagram-appSecret">App Secret</FieldLabel>
                <PasswordInput
                  id="edit-instagram-appSecret"
                  placeholder="abcdef123456..."
                  {...register("instagramInfo.appSecret")}
                />
                <FieldError errors={[errors.instagramInfo?.appSecret]} />
              </Field>
            </FieldSet>
          </FieldGroup>

          <DialogFooter className="mt-6">
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
