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
    additional: (params?: { search?: string; page?: number; limit?: number }) =>
      ["customers", "additional", params?.search ?? "", params?.page ?? 1, params?.limit ?? 20] as const,
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

  conversationStats: {
    count: (params?: { date?: string; from?: string; to?: string }) =>
      ["conversationStats", "count", params ?? {}] as const,
  },

  llmUsage: {
    totals: (params?: { date?: string; from?: string; to?: string }) =>
      ["llmUsage", "totals", params ?? {}] as const,
  },

  bookings: {
    all: () => ["bookings"] as const,
    list: (params?: { page?: number; limit?: number; status?: string }) =>
      ["bookings", "list", params?.status ?? "", params?.page ?? 1, params?.limit ?? 20] as const,
  },

  bookingStats: {
    all: () => ["bookingStats"] as const,
    count: (params?: { date?: string; from?: string; to?: string }) =>
      ["bookingStats", "count", params ?? {}] as const,
    countCreated: (params?: { date?: string; from?: string; to?: string }) =>
      ["bookingStats", "countCreated", params ?? {}] as const,
  },
} as const
