import { z } from "zod"

const whatsappInfoSchema = z.object({
  accessToken: z.string().min(1, "El access token de WhatsApp es requerido"),
  whatsappBusinessId: z.string().min(1, "El WhatsApp Business ID es requerido"),
  appSecret: z.string().min(1, "El app secret de WhatsApp es requerido"),
  phoneNumberId: z.string().min(1, "El Phone Number ID es requerido"),
  webhookVerifyToken: z.string().optional(),
})

const instagramInfoSchema = z.object({
  accessToken: z.string().min(1, "El access token de Instagram es requerido"),
  pageId: z.string().min(1, "El Page ID es requerido"),
  accountId: z.string().min(1, "El Account ID es requerido"),
  appSecret: z.string().min(1, "El app secret de Instagram es requerido"),
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

export type CreateTenantFormData = z.infer<typeof createTenantSchema>
