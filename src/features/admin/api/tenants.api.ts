import { apiClient } from "@/lib/api/client"
import type { CreateTenantFormData } from "@/features/admin/schemas/createTenant.schema"

export interface Tenant {
  id: string
  name: string
  slug: string
  createdAt: string
}

export const tenantsApi = {
  create: (data: CreateTenantFormData) =>
    apiClient.post<Tenant>("/api/tenants", data),

  list: () =>
    apiClient.get<Tenant[]>("/api/tenants"),
}
