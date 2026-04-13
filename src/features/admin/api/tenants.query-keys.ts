export const tenantQueryKeys = {
  all: () => ["tenants"] as const,
  detail: (id: string) => ["tenants", id] as const,
  botStatus: () => ["tenants", "bot-status"] as const,
}
