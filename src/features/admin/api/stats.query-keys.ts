export const adminStatsQueryKeys = {
  messageCount: (params: { tenantId: string; date?: string; from?: string; to?: string }) =>
    ["admin", "messageStats", "count", params] as const,

  customerCount: (params: { tenantId: string; date?: string; from?: string; to?: string }) =>
    ["admin", "customerStats", "count", params] as const,

  llmUsage: (params: { tenantId: string; date?: string; from?: string; to?: string }) =>
    ["admin", "llmUsage", "totals", params] as const,
}
