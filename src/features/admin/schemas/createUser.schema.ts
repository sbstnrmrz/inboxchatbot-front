import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.email("Ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["user", "admin"], { error: "El rol es requerido" }),
  tenantId: z.string().min(1, "El tenant es requerido"),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
