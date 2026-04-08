/**
 * Centralized query key factory.
 *
 * Convention: keys are arrays so TanStack Query can do granular invalidation.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.conversations.detail(id) })
 */
export const queryKeys = {
  tenants: {
    all: () => ["tenants"] as const,
    detail: (id: string) => ["tenants", id] as const,
  },

  conversations: {
    all: () => ["conversations"] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? ["conversations", "list", filters] as const : ["conversations", "list"] as const,
    detail: (id: string) => ["conversations", id] as const,
  },

  messages: {
    all: () => ["messages"] as const,
    byConversation: (conversationId: string) =>
      ["messages", "conversation", conversationId] as const,
  },

  customers: {
    all: () => ["customers"] as const,
    list: () => ["customers", "list"] as const,
    detail: (id: string) => ["customers", id] as const,
    additional: () => ["customers", "additional"] as const,
  },

  tags: {
    all: () => ["tags"] as const,
  },

  messageStats: {
    count: (params?: { date?: string; from?: string; to?: string }) =>
      ["messageStats", "count", params ?? {}] as const,
  },

  customerStats: {
    count: (params?: { date?: string; from?: string; to?: string }) =>
      ["customerStats", "count", params ?? {}] as const,
  },

  llmUsage: {
    totals: (params?: { date?: string; from?: string; to?: string }) =>
      ["llmUsage", "totals", params ?? {}] as const,
  },
} as const
