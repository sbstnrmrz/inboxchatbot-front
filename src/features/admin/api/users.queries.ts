import { apiClient } from "@/lib/api/client"
import type { CreateUserFormData } from "@/features/admin/schemas/createUser.schema"
import type { EditUserFormData } from "@/features/admin/schemas/editUser.schema"

export const usersQueries = {
  create: (data: CreateUserFormData) =>
    apiClient.post("/users", data),

  update: ({ id, data }: { id: string; data: EditUserFormData }) =>
    apiClient.patch(`/users/${id}`, data),
}
