import { z } from "zod"

export const sendMessageSchema = z.object({
  body: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(4096, "El mensaje no puede superar los 4096 caracteres"),
})

export type SendMessageFormData = z.infer<typeof sendMessageSchema>
