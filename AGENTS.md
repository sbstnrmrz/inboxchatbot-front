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

## Final Note

This frontend is expected to scale to **many tenants**, **high message throughput**, and **real‑time collaboration**. Every agent decision should favor maintainability, performance, and clarity over short‑term convenience.

```

