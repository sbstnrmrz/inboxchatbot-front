import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
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
import { tenantsQueries } from "@/features/admin/api/tenants.queries"
import { queryKeys } from "@/lib/query-keys"
import { toast } from "sonner"

interface CreateTenantFormProps {
  onSuccess?: () => void
}

export function CreateTenantForm({ onSuccess }: CreateTenantFormProps = {}) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTenantFormInput>({
    resolver: zodResolver(createTenantSchema) as any,
  })

  const mutation = useMutation({
    mutationFn: tenantsQueries.create,
    onSuccess: () => {
      toast.success('Tenant creado exitosamente')
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all() })
      reset()
      onSuccess?.()
    },
  })

  const onSubmit = (data: CreateTenantFormInput) => {
    mutation.mutate(data as unknown as CreateTenantFormData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* ── Información general ─────────────────────────────── */}
            <FieldSet>
              <FieldLegend>Información general</FieldLegend>

              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  placeholder="Acme Corp"
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="slug">Slug</FieldLabel>
                <Input
                  id="slug"
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
                  (opcional, debe establecerse para que funcione el bot correctamente)
                </span>
              </FieldLegend>

              <Field>
                <FieldLabel htmlFor="whatsapp-accessToken">
                  Access Token
                </FieldLabel>
                <PasswordInput
                  id="whatsapp-accessToken"
                  placeholder="EAAxxxxxxx..."
                  {...register("whatsappInfo.accessToken")}
                />
                <FieldError errors={[errors.whatsappInfo?.accessToken]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="whatsapp-businessId">
                  WhatsApp Business ID
                </FieldLabel>
                <Input
                  id="whatsapp-businessId"
                  placeholder="123456789"
                  {...register("whatsappInfo.businessAccountId")}
                />
                <FieldError errors={[errors.whatsappInfo?.businessAccountId]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="whatsapp-appSecret">App Secret</FieldLabel>
                <PasswordInput
                  id="whatsapp-appSecret"
                  placeholder="abcdef123456..."
                  {...register("whatsappInfo.appSecret")}
                />
                <FieldError errors={[errors.whatsappInfo?.appSecret]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="whatsapp-phoneNumberId">
                  Phone Number ID
                </FieldLabel>
                <Input
                  id="whatsapp-phoneNumberId"
                  placeholder="987654321"
                  {...register("whatsappInfo.phoneNumberId")}
                />
                <FieldError errors={[errors.whatsappInfo?.phoneNumberId]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="whatsapp-webhookVerifyToken">
                  Webhook Verify Token{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </FieldLabel>
                <PasswordInput
                  id="whatsapp-webhookVerifyToken"
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
                  (opcional, debe establecerse para que funcione el bot correctamente)
                </span>
              </FieldLegend>

              <Field>
                <FieldLabel htmlFor="instagram-accessToken">
                  Access Token
                </FieldLabel>
                <PasswordInput
                  id="instagram-accessToken"
                  placeholder="IGAAxxxxxxx..."
                  {...register("instagramInfo.accessToken")}
                />
                <FieldError errors={[errors.instagramInfo?.accessToken]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="instagram-pageId">
                  Page ID{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </FieldLabel>
                <Input
                  id="instagram-pageId"
                  placeholder="123456789"
                  {...register("instagramInfo.pageId")}
                />
                <FieldError errors={[errors.instagramInfo?.pageId]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="instagram-accountId">Account ID</FieldLabel>
                <Input
                  id="instagram-accountId"
                  placeholder="987654321"
                  {...register("instagramInfo.accountId")}
                />
                <FieldError errors={[errors.instagramInfo?.accountId]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="instagram-appSecret">App Secret</FieldLabel>
                <PasswordInput
                  id="instagram-appSecret"
                  placeholder="abcdef123456..."
                  {...register("instagramInfo.appSecret")}
                />
                <FieldError errors={[errors.instagramInfo?.appSecret]} />
              </Field>
            </FieldSet>

          </FieldGroup>

          <DialogFooter className="mt-6">
            {mutation.isError && (
              <p className="text-destructive text-sm mr-auto">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Error al crear el tenant"}
              </p>
            )}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creando..." : "Crear tenant"}
            </Button>
          </DialogFooter>
        </form>
  )
}
