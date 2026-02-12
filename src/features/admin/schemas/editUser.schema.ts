import { z } from "zod"

export const editUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.email("Ingresa un correo electrónico válido"),
  role: z.enum(["user", "admin"], { error: "El rol es requerido" }),
  tenantId: z.string().min(1, "El tenant es requerido"),
})

export type EditUserFormData = z.infer<typeof editUserSchema>
