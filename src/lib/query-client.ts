import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Datos considerados frescos por 1 minuto
      staleTime: 1000 * 60,
      // Reintentar una sola vez en caso de error
      retry: 1,
      // No refetchear al volver a la pestaña (útil para inbox con sockets)
      refetchOnWindowFocus: false,
    },
    mutations: {
      // No reintentar mutaciones por defecto
      retry: false,
    },
  },
})
