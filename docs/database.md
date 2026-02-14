# Local Database (Dexie / IndexedDB)

## Overview

Dexie.js is used as a local persistence and cache layer on top of TanStack Query. It is **not** the source of truth — server state always wins on conflict.

**What is cached:** `Customer`, `Conversation`, `Message`, and draft text per conversation.  
**What is not cached:** `Tenant`, `Membership`, `User` — administrative data that does not benefit from local caching.

---

## File Structure

```
src/
├── types/
│   ├── customer.type.ts       # Server-side Customer shape
│   ├── conversation.type.ts   # Server-side Conversation shape
│   └── message.type.ts        # Server-side Message shape
└── lib/
    ├── db/
    │   ├── schema.ts           # Cached entity shapes (CachedConversation, etc.)
    │   ├── database.ts         # Dexie instance + versioned schema
    │   ├── index.ts            # Barrel export
    │   └── repositories/
    │       ├── customers.repository.ts
    │       ├── conversations.repository.ts
    │       ├── messages.repository.ts
    │       └── drafts.repository.ts
    └── sync/
        ├── mappers.ts          # Pure functions: API object → Cached shape
        ├── customers.sync.ts
        ├── conversations.sync.ts
        ├── messages.sync.ts
        ├── db-lifecycle.ts     # clearTenantCache / clearAllCache
        └── index.ts            # Barrel export
```

---

## Domain Types (`src/types/`)

### `customer.type.ts`

```ts
Customer {
  _id: string
  tenantId: string
  name: string
  whatsappInfo?: { id: string; name: string }
  instagramInfo?: { accountId: string; name?: string; username?: string }
  isBlocked: boolean
  createdAt?: string
  updatedAt?: string
}
```

### `conversation.type.ts`

```ts
ConversationChannel = "WHATSAPP" | "INSTAGRAM"
ConversationStatus  = "OPEN" | "PENDING" | "CLOSED"

Conversation {
  _id: string
  tenantId: string
  customerId: string
  channel: ConversationChannel
  status: ConversationStatus
  lastMessage?: Message       // populated by API
  lastMessageAt?: string
  unreadCount: number
  requestingAgent: boolean
  botEnabled: boolean
  botDisabledAt?: string
  createdAt?: string
  updatedAt?: string
}
```

### `message.type.ts`

```ts
MessageChannel   = "WHATSAPP" | "INSTAGRAM"
MessageDirection = "INBOUND" | "OUTBOUND"
MessageStatus    = "SENT" | "DELIVERED" | "READ" | "FAILED"
MessageType      = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT"
                 | "STICKER" | "LOCATION" | "CONTACTS" | "INTERACTIVE"
                 | "BUTTON" | "REACTION" | "ORDER" | "REEL" | "SHARE"
                 | "POSTBACK" | "SYSTEM" | "UNKNOWN"
SenderType       = "CUSTOMER" | "USER" | "BOT"

Message {
  _id: string
  tenantId: string
  conversationId: string
  channel: MessageChannel
  direction: MessageDirection
  messageType: MessageType
  sender: { type: SenderType; id?: string }
  body?: string
  media?: MessageMedia
  externalId?: string
  status: MessageStatus
  sentAt: string            // channel timestamp (ISO)
  deliveredAt?: string
  readAt?: string
  referral?: MessageReferral
  createdAt?: string
  updatedAt?: string
}
```

---

## Dexie Schema (`src/lib/db/`)

### Cached entity shapes (`schema.ts`)

These are the shapes stored in IndexedDB — flattened where needed for indexing.

| Shape | Key fields | Notes |
|---|---|---|
| `CachedCustomer` | `id`, `tenantId` | `whatsappId` and `instagramAccountId` flattened for compound index lookup |
| `CachedConversation` | `id`, `tenantId`, `customerId` | `lastMessageAt` stored as Unix ms for sorting; `lastMessagePreview` derived from `lastMessage` |
| `CachedMessage` | `id`, `tenantId`, `conversationId` | `sentAt` stored as Unix ms for range queries |
| `CachedDraft` | `id` = `${tenantId}:${conversationId}` | At most one draft per conversation |
| `SyncMeta` | `id` = `${tenantId}:${entity}` | Tracks last successful sync timestamp per entity |

### Database instance (`database.ts`)

Singleton `db` exported from `database.ts`. Tables and their indexes:

```
customers:
  PK: id
  Indexes: tenantId, [tenantId+whatsappId], [tenantId+instagramAccountId]

conversations:
  PK: id
  Indexes: tenantId, customerId, [tenantId+status], [tenantId+channel],
           [tenantId+lastMessageAt]

messages:
  PK: id
  Indexes: tenantId, conversationId, [conversationId+sentAt], externalId

drafts:
  PK: id  (= "${tenantId}:${conversationId}")
  Indexes: tenantId, conversationId

syncMeta:
  PK: id  (= "${tenantId}:${entity}")
  Indexes: tenantId
```

**Versioning rule:** never modify an existing `.version(n)` block. Always add a new `.version(n+1)` when adding tables or indexed columns.

---

## Repositories (`src/lib/db/repositories/`)

Repositories are the only place that talks to Dexie directly. Import them from sync helpers or hooks — never from UI components.

### `conversationsRepository`

| Method | Description |
|---|---|
| `upsert(conversation)` | Add or replace by id |
| `upsertMany(conversations[])` | Bulk upsert in a single transaction |
| `getById(id)` | Single conversation lookup |
| `getAllByTenant(tenantId)` | All conversations sorted by `lastMessageAt` desc |
| `getByStatus(tenantId, status)` | Filtered + sorted |
| `getByChannel(tenantId, channel)` | Filtered + sorted |
| `patch(id, changes)` | Partial update (unread count, bot status, etc.) |
| `delete(id)` | Remove by id |
| `clearByTenant(tenantId)` | Remove all for a tenant |

### `messagesRepository`

| Method | Description |
|---|---|
| `upsert(message)` | Add or replace by id |
| `upsertMany(messages[])` | Bulk upsert in a single transaction |
| `getById(id)` | Single message lookup |
| `getByConversation(conversationId)` | All messages, oldest first |
| `getRecentByConversation(conversationId, limit?)` | Last N messages, oldest first (default 50) |
| `getPageBefore(conversationId, beforeSentAt, limit?)` | Cursor-based pagination going back |
| `updateStatus(id, status, timestamps?)` | Update delivery/read status |
| `delete(id)` | Remove by id |
| `clearByConversation(conversationId)` | Remove all messages for a conversation |
| `clearByTenant(tenantId)` | Remove all for a tenant |

### `customersRepository`

| Method | Description |
|---|---|
| `upsert(customer)` | Add or replace by id |
| `upsertMany(customers[])` | Bulk upsert in a single transaction |
| `getById(id)` | Single customer lookup |
| `getAllByTenant(tenantId)` | All customers for a tenant |
| `getByWhatsAppId(tenantId, whatsappId)` | Lookup by WA contact id |
| `getByInstagramAccountId(tenantId, accountId)` | Lookup by IG account id |
| `delete(id)` | Remove by id |
| `clearByTenant(tenantId)` | Remove all for a tenant |

### `draftsRepository`

| Method | Description |
|---|---|
| `save(tenantId, conversationId, body)` | Create or overwrite draft |
| `get(tenantId, conversationId)` | Read current draft |
| `delete(tenantId, conversationId)` | Remove after sending |
| `clearByTenant(tenantId)` | Remove all drafts for a tenant |

---

## Sync Layer (`src/lib/sync/`)

Sync helpers convert server API objects to cached shapes and write them to IndexedDB. They are called from TanStack Query hooks (`onSuccess`) or socket event handlers.

### Mappers (`mappers.ts`)

Pure functions, no side effects:

```ts
mapCustomerToCache(customer: Customer): CachedCustomer
mapCustomersToCache(customers: Customer[]): CachedCustomer[]

mapConversationToCache(conversation: Conversation): CachedConversation
mapConversationsToCache(conversations: Conversation[]): CachedConversation[]

mapMessageToCache(message: Message): CachedMessage
mapMessagesToCache(messages: Message[]): CachedMessage[]
```

`mapConversationToCache` derives `lastMessagePreview` from `conversation.lastMessage` automatically (text truncated to 80 chars; media types shown as emoji labels).

### Sync functions

```ts
// customers.sync.ts
syncCustomers(customers: Customer[]): Promise<void>
syncCustomer(customer: Customer): Promise<void>
removeCustomer(id: string): Promise<void>

// conversations.sync.ts
syncConversations(conversations: Conversation[]): Promise<void>
syncConversation(conversation: Conversation): Promise<void>
patchConversation(id: string, changes: Partial<CachedConversation>): Promise<void>
removeConversation(id: string): Promise<void>

// messages.sync.ts
syncMessages(messages: Message[]): Promise<void>
syncMessage(message: Message): Promise<void>
updateMessageStatus(id, status, timestamps?): Promise<void>
clearConversationMessages(conversationId: string): Promise<void>
```

### DB lifecycle (`db-lifecycle.ts`)

```ts
clearTenantCache(tenantId: string): Promise<void>  // call on sign-out
clearAllCache(): Promise<void>                      // call on forced reset
```

---

## Usage Patterns

### 1. Hydrate cache after list query

```ts
// features/inbox/hooks/useConversations.ts
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: conversationsQueries.list,
    onSuccess: async (data) => {
      await syncConversations(data)
    },
  })
}
```

### 2. Pre-populate UI from cache while fetching

```ts
export function useConversations(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: conversationsQueries.list,
    placeholderData: () => {
      // useLiveQuery (dexie-react-hooks) is the preferred approach for reactive reads
      // For one-shot initial data, read synchronously before mount
    },
  })
}
```

### 3. Sync on socket events

```ts
// features/sockets/hooks/useSocket.ts
socket.on(SocketEvents.ConversationUpdated, async (conv: Conversation) => {
  await syncConversation(conv)
  queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() })
})

socket.on(MessageEvent.Received, async (msg: Message) => {
  await syncMessage(msg)
  queryClient.invalidateQueries({
    queryKey: queryKeys.messages.byConversation(msg.conversationId),
  })
})
```

### 4. Clear cache on sign-out

```ts
// features/auth/context/AuthContext.tsx
const signOut = async () => {
  await clearTenantCache(session.tenantId)
  await authClient.signOut()
}
```

---

## Rules

1. **IndexedDB is a cache, not the source of truth.** Server state from TanStack Query always wins.
2. **All tables are tenant-isolated.** Every row has `tenantId`; `clearTenantCache` must be called on sign-out.
3. **UI components never access Dexie directly.** They use hooks, which use sync helpers, which use repositories.
4. **Never skip version bumps.** Add `.version(n+1)` when changing the indexed schema.
5. **Conflicts resolve in favor of server state.** `upsert` / `bulkPut` always overwrites local data with fresh server data.
