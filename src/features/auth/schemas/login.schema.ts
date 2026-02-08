import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
