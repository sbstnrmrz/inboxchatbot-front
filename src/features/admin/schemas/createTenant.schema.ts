import { z } from "zod"

// Si el usuario no llena ningún campo del bloque, RHF envía strings vacíos.
// El .transform convierte ese objeto "vacío" en undefined para que la validación
// interna no se dispare cuando el bloque es opcional.

const whatsappInfoSchema = z
  .object({
    accessToken: z.string(),
    businessAccountId: z.string(),
    appSecret: z.string(),
    phoneNumberId: z.string(),
    webhookVerifyToken: z.string().optional(),
  })
  .transform((val, ctx) => {
    const { webhookVerifyToken, ...required } = val
    const hasAny = Object.values(required).some((v) => v.trim() !== "")

    // Si no llenó nada, devolver undefined (bloque omitido)
    if (!hasAny) return undefined

    // Si llenó algo, validar que todos los campos requeridos estén completos
    if (!val.accessToken.trim())
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["accessToken"], message: "El access token de WhatsApp es requerido" })
    if (!val.businessAccountId.trim())
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["businessAccountId"], message: "El WhatsApp Business ID es requerido" })
    if (!val.appSecret.trim())
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["appSecret"], message: "El app secret de WhatsApp es requerido" })
    if (!val.phoneNumberId.trim())
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phoneNumberId"], message: "El Phone Number ID es requerido" })

    return {
      accessToken: val.accessToken,
      businessAccountId: val.businessAccountId,
      appSecret: val.appSecret,
      phoneNumberId: val.phoneNumberId,
      webhookVerifyToken: val.webhookVerifyToken || undefined,
    }
  })

const instagramInfoSchema = z
  .object({
    accessToken: z.string(),
    pageId: z.string().optional(),
    accountId: z.string(),
    appSecret: z.string(),
  })
  .transform((val, ctx) => {
    const { pageId, ...required } = val
    const hasAny = Object.values(required).some((v) => v.trim() !== "")

    if (!hasAny) return undefined

    if (!val.accessToken.trim())
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["accessToken"], message: "El access token de Instagram es requerido" })
    if (!val.accountId.trim())
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["accountId"], message: "El Account ID es requerido" })
    if (!val.appSecret.trim())
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["appSecret"], message: "El app secret de Instagram es requerido" })

    return {
      ...val,
      pageId: val.pageId?.trim() || undefined,
    }
  })

export const createTenantSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones"
    ),
  whatsappInfo: whatsappInfoSchema.optional(),
  instagramInfo: instagramInfoSchema.optional(),
})

// Tipo de entrada: lo que RHF maneja (strings crudos del form)
export type CreateTenantFormInput = z.input<typeof createTenantSchema>

// Tipo de salida: lo que llega al onSubmit tras pasar por .transform()
export type CreateTenantFormData = z.output<typeof createTenantSchema>
