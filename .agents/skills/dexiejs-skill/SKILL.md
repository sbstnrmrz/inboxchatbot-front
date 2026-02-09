---
name: dexiejs-skill 
description: Skill for implementing DexieJS in TypeScript/JavaScript.
---

# Dexie.js (IndexedDB Local Persistence) Integration Guide
**Always consult [dexie.org/docs/API-Reference](https://dexie.org/docs/API-Reference) for code examples and latest API.**

**Goal**
Provide fast, offline-capable, and scalable client-side persistence using **Dexie.js** as a performance and UX layer on top of TanStack Query.

**Scope**
- IndexedDB schema definition and migrations
- Local caching for read-heavy data (messages, conversations)
- Draft persistence and optimistic hydration
- Sync helpers between IndexedDB and server state

**Inputs**
- Normalized server data (from TanStack Query)
- Tenant context (`tenantId`)
- Conversation identifiers

**Outputs**
- Locally cached entities
- Hydration data for queries
- Persisted drafts and UI metadata


**Capabilities**
- Define and version Dexie schemas
- Read/write message and conversation data efficiently
- Support offline read access
- Preload UI with cached data before network responses


**Constraints & Rules**
- IndexedDB is **not** the source of truth
- Server state always wins on conflicts
- All tables must be **tenant-isolated**
- UI components must never access Dexie directly
- No auth, permissions, or sensitive logic stored locally


**Typical Usage**
- Inbox loads instantly from IndexedDB
- TanStack Query refetches and reconciles data
- Dexie cache updates after successful server sync


**Non-Goals**
- Full offline write synchronization
- Business rule enforcement
- Cross-device state consistency


**Failure Handling**
- Corrupted cache → safely purge and rehydrate from server
- Version mismatch → run migration or reset local DB

---
