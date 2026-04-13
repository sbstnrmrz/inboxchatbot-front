import { apiClient } from "@/lib/api/client"
import type { CreateTenantFormData } from "@/features/admin/schemas/createTenant.schema"
import type { Tenant } from "@/types/tenant.type";

export interface BotStatusResponse {
  botEnabled: boolean
}

export const tenantsQueries = {
  create: (data: CreateTenantFormData) =>
    apiClient.post<Tenant>("/tenants", data),

  update: ({ id, data }: { id: string; data: Partial<CreateTenantFormData> }) =>
    apiClient.patch<Tenant>(`/tenants/${id}`, data),

  list: () =>
    apiClient.get<Tenant[]>("/tenants"),

  getById: (id: string) =>
    apiClient.get<Tenant>(`/tenants/${id}`),

  getBotStatus: () =>
    apiClient.get<BotStatusResponse>("/tenants/bot-status"),

  toggleBot: () =>
    apiClient.post<BotStatusResponse>("/tenants/toggle-bot"),
}
