import { useAuth } from "@/features/auth/context";
import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from "../types/events";

const URL = import.meta.env.API_URL || 'http://localtest.me:3001'
const PATH = '/socket'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const {session} = useAuth();

  useEffect(() => {
    function onConnect() {
      logger.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      setIsReconnecting(false);
    }
    function onDisconnect(reason: Socket.DisconnectReason) {
      logger.log('Socket disconnected:', reason);
      setIsConnected(false);
    }

    const newSocket = io(URL.replace('/api', ''), {
      path: PATH,
      auth: {
        session
      },
      withCredentials: true, // Important: sends cookies with socket connection
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on(SocketEvents.Connect, onConnect);
    newSocket.on(SocketEvents.Disconnect, onDisconnect);

    newSocket.on(SocketEvents.ConnectError, (error) => {
      logger.error('🔴 Socket connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on(SocketEvents.Reconnect, (attemptNumber) => {
      logger.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setIsReconnecting(false);
    });

    newSocket.on(SocketEvents.ReconnectAttemp, (attemptNumber) => {
      logger.log('🔄 Reconnection attempt:', attemptNumber);
      setIsReconnecting(true);
    });

    newSocket.on(SocketEvents.ReconnectError, (error) => {
      logger.error('🔴 Reconnection error:', error.message);
      setIsReconnecting(true);
    });

    newSocket.on(SocketEvents.ReconnectFailed, () => {
      logger.error('🔴 Reconnection failed');
      setIsConnected(false);
      setIsReconnecting(false);
    });

    // Set socket state asynchronously to avoid cascading renders
    queueMicrotask(() => {
      setSocket(newSocket);
    });

    // Cleanup on unmount
    return () => {
      newSocket.off(SocketEvents.Connect);
      newSocket.off('disconnect');
      newSocket.disconnect();
      setSocket(null);
    };
  }, [])

}
