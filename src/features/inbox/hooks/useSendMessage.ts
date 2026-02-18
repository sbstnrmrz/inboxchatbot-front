/**
 * useSendMessage — emits a manual outbound message over the active Socket.IO
 * connection using the 'message_sent' event and writes an optimistic
 * "SENDING" entry to IndexedDB so the UI renders it immediately.
 *
 * Flow:
 *  1. Optimistic CachedMessage (status: "SENDING") is written to IndexedDB.
 *  2. useLiveMessages picks it up → message appears in the chat right away.
 *  3. socket.emit('message_sent', dto) is sent to the server.
 *  4. Server processes and broadcasts 'message_sent' back.
 *  5. useMessageEvents receives the echo → calls confirmSentMessage()
 *     which deletes the SENDING temp and upserts the real message.
 *
 * Usage:
 *   const { send, isSending } = useSendMessage({ socket, tenantId, channel, senderId })
 *   send({ conversationId, messageType: 'TEXT', body: 'Hello' })
 */

import { useRef, useState } from "react"
import { Socket } from "socket.io-client"
import { MessageEvent } from "@/features/sockets/types/events"
import { logger } from "@/lib/logger"
import type { SendMessageDto, MessageChannel } from "@/types/message.type"

interface UseSendMessageOptions {
  socket: Socket | null
  tenantId: string
  channel: MessageChannel
  senderId: string
}

interface UseSendMessageReturn {
  send: (dto: SendMessageDto) => void
  isSending: boolean
}

export function useSendMessage({
  socket,
  tenantId,
  channel,
  senderId,
}: UseSendMessageOptions): UseSendMessageReturn {
  const [isSending, setIsSending] = useState(false)

  // Refs so send() always reads the latest values without stale closures
  const socketRef = useRef(socket)
  const tenantIdRef = useRef(tenantId)
  const channelRef = useRef(channel)
  const senderIdRef = useRef(senderId)

  socketRef.current = socket
  tenantIdRef.current = tenantId
  channelRef.current = channel
  senderIdRef.current = senderId

  const send = (dto: SendMessageDto) => {
    const currentSocket = socketRef.current

    if (!currentSocket?.connected) {
      logger.error("[useSendMessage] socket not connected — cannot send message")
      return
    }

    const tempId = `temp_123`

    // Write optimistic message to IndexedDB — UI renders immediately
//  syncOptimisticMessage({
//    tempId,
//    tenantId: tenantIdRef.current,
//    conversationId: dto.conversationId,
//    channel: channelRef.current,
//    messageType: dto.messageType,
//    body: dto.body,
//    senderId: senderIdRef.current,
//  }).catch(console.error)

    setIsSending(true)
    logger.debug("[useSendMessage] emitting", MessageEvent.Sent, dto)

    logger.debug(`Message Sent`);
    logger.debug(dto);
    currentSocket.emit(MessageEvent.Sent, dto, () => {
      setIsSending(false)
    })

    // Fallback reset in case the server sends no ack
    setTimeout(() => setIsSending(false), 3000)
  }

  return { send, isSending }
}
