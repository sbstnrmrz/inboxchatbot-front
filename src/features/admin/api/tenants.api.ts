import { apiClient } from "@/lib/api/client"
import type { CreateTenantFormData } from "@/features/admin/schemas/createTenant.schema"
import type { Tenant } from "@/types/tenant.type";

export const tenantsApi = {
  create: (data: CreateTenantFormData) =>
    apiClient.post<Tenant>("/tenants", data),

  update: ({ id, data }: { id: string; data: Partial<CreateTenantFormData> }) =>
    apiClient.patch<Tenant>(`/tenants/${id}`, data),

  list: () =>
    apiClient.get<Tenant[]>("/tenants"),
}
