# AGENTS.md

## Purpose

This document defines **AI agents**, their responsibilities, boundaries, and collaboration rules for the **frontend** of the Omnichannel CRM-like web application. It is meant to guide both human contributors and AI assistants working on the codebase so changes stay consistent, scalable, and production‑ready.

The app unifies **WhatsApp** and **Instagram** conversations into a single inbox with AI-assisted responses.

---

## Project Context

### Product

A **React + Vite** omnichannel CRM (similar to Zendesk or respond.io) focused on real‑time messaging, agent productivity, and AI‑assisted replies.

### Tech Stack

* **Framework**: React + Vite
* **Routing**: TanStack Router
* **Language**: TypeScript
* **Styling**: TailwindCSS
* **Icons**: Lucide
* **UI Components**: shadcn/ui
* **Data Fetching & Cache**: TanStack Query
* **Forms & Validation**: React Hook Form + Zod
* **Authentication**: better-auth
* **Package Manager**: pnpm

---

## Agent Philosophy

Agents are **role‑based specialists**, not generalists. Each agent:

* Owns a clear domain
* Avoids leaking responsibilities into other layers
* Produces predictable, reviewable output

Agents should:

* Prefer **composition over abstraction**
* Respect **TanStack Query** as the single source of server state
* Keep UI logic **stateless when possible**
* Assume the app is **multitenant and real‑time**

---

## Core Frontend Agents

> **Note**: The frontend uses **Dexie.js (IndexedDB)** for local persistence, offline support, and performance optimizations. This introduces a dedicated Local Persistence Agent defined below.

### 1. UI / Layout Agent

**Responsibility**

* Page layouts, shells, and visual structure
* Navigation, sidebars, headers, inbox layout

**Owns**

* Layout components (`AppLayout`, `InboxLayout`, etc.)
* Responsive behavior
* Tailwind-based spacing, grids, and alignment

**Rules**

* No data fetching
* No business logic
* Receives data via props only

---

### 2. Routing Agent

**Responsibility**

* Application routing and navigation structure

**Owns**

* TanStack Router route definitions
* Route loaders (lightweight only)
* Auth/permission-based route guards

**Rules**

* Must not fetch server state directly (delegate to Query Agent)
* Routes should map 1:1 with product concepts

---

### 3. Server State Agent (TanStack Query)

**Responsibility**

* All communication with backend APIs
* Cache, invalidation, pagination, and polling

**Owns**

* Query keys
* `useQuery`, `useInfiniteQuery`, `useMutation`
* Optimistic updates for chat messages

**Rules**

* No UI rendering
* No direct DOM interaction
* Every API call must go through this layer

---

### 4. Forms & Validation Agent

**Responsibility**

* Managing user input and validation

**Owns**

* React Hook Form setup
* Zod schemas
* Form-level error handling

**Rules**

* Validation logic lives in Zod, not components
* No API calls directly (use mutations from Server State Agent)

---

### 5. Auth & Session Agent

**Responsibility**

* Authentication, session state, and identity

**Owns**

* better-auth integration
* Session hydration
* User/tenant context

**Rules**

* No UI rendering
* Exposes hooks like `useSession`, `useUser`, `useTenant`

---

### 6. Chat & Messaging Agent

**Responsibility**

* Core inbox behavior and message flow

**Owns**

* Message lists
* Conversation state
* Read/unread logic
* Channel differentiation (WhatsApp vs Instagram)

**Rules**

* Stateless UI when possible
* Real‑time updates must integrate with Query cache

---

### 7. AI Assistance Agent

**Responsibility**

* AI-generated suggestions and automation UI

**Owns**

* AI reply suggestions
* Prompt context UI
* Agent assist panels

**Rules**

* AI is assistive, never authoritative
* Must allow human override at all times

---

### 8. Design System Agent

**Responsibility**

* Consistency and reuse of UI elements

**Owns**

* shadcn components
* Shared buttons, inputs, modals
* Tailwind design tokens

**Rules**

* No business logic
* Components must be theme-ready

---

### 9. Local Persistence Agent (Dexie / IndexedDB)

**Responsibility**

* Client-side persistence and offline-first behavior
* High-performance local reads for chat-heavy views

**Owns**

* Dexie database schema and versioning
* IndexedDB tables (messages, conversations, drafts, metadata)
* Sync helpers between IndexedDB and TanStack Query cache

**Use Cases**

* Message history caching
* Draft persistence per conversation
* Offline read access
* Optimistic UI hydration before server responses

**Rules**

* IndexedDB is a **cache and UX layer**, never the source of truth
* Server state still belongs to TanStack Query
* Must handle multi-tenant data isolation explicitly
* No direct DOM or UI rendering

---

## Cross‑Cutting Rules

### State Management

* **Server state** → TanStack Query
* **Local persistence / offline cache** → Dexie (IndexedDB)
* **Client/UI state** → local React state

**Rules**

* Dexie may hydrate Query cache, but not replace it
* Conflicts are resolved in favor of server state
* Never read IndexedDB directly from UI components

---

## Folder Structure (Recommended)

```
src/
├─ app/            # App bootstrap & providers
├─ routes/         # TanStack Router routes
├─ features/       # Domain-driven features (chat, auth, inbox)
├─ components/     # Shared UI components
├─ hooks/          # Reusable hooks
├─ lib/            # Utilities, clients, helpers
│  ├─ api/         # HTTP / fetch clients
│  ├─ db/          # Dexie database, schema, migrations
│  └─ sync/        # Server <-> IndexedDB sync logic
├─ schemas/        # Zod schemas
└─ styles/         # Global styles & Tailwind config
```

```
src/
├─ app/            # App bootstrap & providers
├─ routes/         # TanStack Router routes
├─ features/       # Domain-driven features (chat, auth, inbox)
├─ components/     # Shared UI components
├─ hooks/          # Reusable hooks
├─ lib/            # Utilities, clients, helpers
├─ schemas/        # Zod schemas
└─ styles/         # Global styles & Tailwind config

```

---

## Collaboration Guidelines

- One agent per concern
- Small, incremental changes
- Prefer clarity over cleverness
- If unsure, defer to **predictability and debuggability**

---

## Adding shadcn components
```bash
pnpm dlx shadcn@latest add <component> 
```

---

## Non‑Goals

Agents should NOT:
- Introduce backend logic
- Bypass TanStack Query
- Hardcode tenant or channel assumptions
- Optimize prematurely

---

## Guide: Adding Queries & Query Keys for a Feature

Follow this pattern every time a feature needs to fetch or mutate server data.

### File layout

```
src/features/<feature>/
├─ api/
│  ├─ <feature>.query-keys.ts   # Key factory — pure constants, no logic
│  └─ <feature>.queries.ts      # queryFn / mutationFn — no hooks, no UI
└─ hooks/
   └─ use<Feature>.ts           # useQuery / useMutation wrappers
```

### 1. Query keys (`<feature>.query-keys.ts`)

Keys are **typed tuples** produced by factory functions. This makes invalidation
safe and refactor-friendly.

```ts
// src/features/admin/api/tenants.query-keys.ts
export const tenantQueryKeys = {
  all: ()         => ["tenants"]         as const,
  detail: (id: string) => ["tenants", id] as const,
}
```

Rules:
- One file per feature domain.
- Always use `as const` so TanStack Query infers the narrowest type.
- Nest keys hierarchically so `invalidateQueries({ queryKey: tenantQueryKeys.all() })`
  also invalidates all detail queries.

### 2. Query / mutation functions (`<feature>.queries.ts`)

Plain async functions — no hooks, no React, no UI.

```ts
// src/features/admin/api/tenants.queries.ts
import { apiClient } from "@/lib/api/client"
import type { Tenant } from "@/types/tenant.type"

export const tenantsQueries = {
  list: () => apiClient.get<Tenant[]>("/tenants"),
  create: (data: CreateTenantFormData) => apiClient.post<Tenant>("/tenants", data),
  update: ({ id, data }: { id: string; data: Partial<CreateTenantFormData> }) =>
    apiClient.patch<Tenant>(`/tenants/${id}`, data),
}
```

For **better-auth admin methods** (no REST endpoint), call the client directly
and unwrap the result/error pattern:

```ts
// src/features/admin/hooks/useUsers.ts
import { authClient } from "@/lib/auth-client"

queryFn: async () => {
  const result = await authClient.admin.listUsers({ query: {} })
  if (result.error) throw new Error(result.error.message ?? "Error")
  return result.data?.users ?? []
},
```

### 3. Hook (`use<Feature>.ts`)

Composes keys + query functions. This is the only file UI components import.

```ts
// src/features/admin/hooks/useTenants.ts
import { useQuery } from "@tanstack/react-query"
import { tenantQueryKeys } from "@/features/admin/api/tenants.query-keys"
import { tenantsQueries } from "@/features/admin/api/tenants.queries"

export function useTenants() {
  return useQuery({
    queryKey: tenantQueryKeys.all(),
    queryFn: tenantsQueries.list,
  })
}
```

For mutations, invalidate using the key factory on `onSuccess`:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tenantsQueries.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.all() })
    },
  })
}
```

### Quick checklist

- [ ] `query-keys.ts` — factory functions, `as const`, one file per domain
- [ ] `queries.ts` — pure async functions, no hooks
- [ ] `use<Feature>.ts` — single hook exported, composes keys + fn
- [ ] Mutations invalidate via the key factory, never hardcoded strings
- [ ] UI components import **only** the hook, never `apiClient` or `authClient` directly

---

## Guide: Socket.IO Authentication with better-auth

Socket.IO authentication relies on **browser cookies** managed by better-auth. No token is passed manually — the browser sends the session cookie automatically on the HTTP handshake.

### How it works

1. better-auth sets a `better-auth.session_token` HttpOnly cookie on sign-in.
2. The `useSocket` hook waits until `isPending === false && session !== null` before creating the socket.
3. Socket.IO performs an HTTP long-polling handshake first (`GET /socket?EIO=4&transport=polling`). The browser includes the cookie automatically because `withCredentials: true` is set.
4. The server reads `socket.handshake.headers.cookie` and validates the session.
5. After the handshake, the connection upgrades to WebSocket. The browser also sends cookies on the `Upgrade` request.

### Client configuration

```ts
// src/features/sockets/hooks/useSocket.ts
const socket = io(URL, {
  path: '/socket',
  transports: ['polling', 'websocket'],
  withCredentials: true, // required for cross-origin cookie sending
});
```

**Rules:**
- Never pass the session or token in `auth: { ... }` — better-auth uses HttpOnly cookies, not JS-accessible tokens.
- Never use `extraHeaders` for auth — browsers ignore custom headers on WebSocket upgrades.
- `withCredentials: true` is required whenever frontend and backend run on different origins (different ports count as different origins in development).

### Connection lifecycle

The socket must only connect after the session is confirmed. The `useSocket` hook enforces this:

```ts
useEffect(() => {
  if (isPending) return;        // still loading session — do nothing
  if (!session) {               // not authenticated — disconnect if needed
    socket?.disconnect();
    return;
  }
  // session is valid — create socket
}, [isPending, session]);
```

This prevents a race condition where the socket handshake fires before the session cookie is available, which would result in an auth rejection from the server.

### Server requirements

The backend Socket.IO server must mirror these settings:

```ts
// server-side (NestJS / Express)
new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // exact frontend origin, never "*"
    credentials: true,               // required to accept cookies
  },
  path: '/socket',
});
```

> `origin: "*"` is **incompatible** with `credentials: true`. The browser will block the request.

### Verifying cookies reach the server

```ts
io.on('connection', (socket) => {
  const cookies = socket.handshake.headers.cookie;
  // "better-auth.session_token=abc123; ..."
  // if undefined → CORS misconfiguration on the server
});
```

### Quick checklist

- [ ] `withCredentials: true` set on the `io()` call
- [ ] Socket only created after `isPending === false && session !== null`
- [ ] Server CORS has exact `origin` and `credentials: true`
- [ ] No token passed via `auth`, `extraHeaders`, or `query`
- [ ] `VITE_API_URL` env var used (not `API_URL` — Vite requires the `VITE_` prefix)

---

## Final Note

This frontend is expected to scale to **many tenants**, **high message throughput**, and **real‑time collaboration**. Every agent decision should favor maintainability, performance, and clarity over short‑term convenience.

