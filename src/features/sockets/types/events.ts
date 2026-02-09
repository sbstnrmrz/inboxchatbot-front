export enum SocketEvents {
  Connect = 'connect',
  ConnectError = 'connect_error',

  Disconnect = 'disconnect',
  Reconnect = 'reconnect',

  ReconnectAttemp = 'reconnect_attemp',
  ReconnectError = 'reconnect_error',
  ReconnectFailed = 'reconnect_failed',

  // conversation events for real-time updates
  ConversationCreated = 'conversation_created',
  ConversationUpdated = 'conversation_updated',
  ConversationDeleted = 'conversation_deleted',
}

export enum MessageEvents {
  MessageReceived = 'message_received',
  MessageSent = 'message_sent',

  TranscriptReceived = 'transcript_received',
  WaitingBotResponse = 'waiting_bot_response',
}
