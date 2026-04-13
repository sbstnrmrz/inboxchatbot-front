import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { Socket } from "socket.io-client"
import { TenantEvent } from "@/features/sockets/types/events"
import { tenantQueryKeys } from "@/features/admin/api/tenants.query-keys"
import type { BotStatusResponse } from "@/features/admin/api/tenants.queries"
import { logger } from "@/lib/logger"

interface UseBotToggledEventOptions {
  socket: Socket | null
}

export function useBotToggledEvent({ socket }: UseBotToggledEventOptions) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    const handleBotToggled = (data: BotStatusResponse) => {
      logger.debug("[useBotToggledEvent] bot_toggled", data)
      queryClient.setQueryData(tenantQueryKeys.botStatus(), data)
    }

    socket.on(TenantEvent.BotToggled, handleBotToggled)

    return () => {
      socket.off(TenantEvent.BotToggled, handleBotToggled)
    }
  }, [socket, queryClient])
}
