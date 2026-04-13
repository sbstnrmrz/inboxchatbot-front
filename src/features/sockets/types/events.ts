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

export enum ConversationEvent {
  Read = 'conversation_read',
  RequestAgent = 'request_agent',
  DismissAgent = 'dismiss_agent',
}

export enum MessageEvent {
  Received = 'message_received',
  Sent = 'message_sent',

  TranscriptReceived = 'transcript_received',
  WaitingBotResponse = 'waiting_bot_response',
}

export enum TagEvent {
  Created = 'tag_created',
  Updated = 'tag_updated',
  Deleted = 'tag_deleted',
  ConversationTagAdded = 'conversation_tag_added',
  ConversationTagRemoved = 'conversation_tag_removed',
}

export enum TenantEvent {
  BotToggled = 'bot_toggled',
}
