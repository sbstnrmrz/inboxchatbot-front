---
name: socketio-client-skill
description: Build authenticated real-time client features using Socket.IO with React + Vite and Better Auth
license: MIT
compatibility: opencode
metadata:
  audience: frontend, fullstack
  workflow: realtime, websockets, react, auth
---

## What I do

- Configure `socket.io-client` in React + Vite projects
- Integrate Socket.IO authentication using Better Auth sessions or tokens
- Attach auth data during the connection handshake
- Create reusable Socket providers and hooks
- Manage connection lifecycle (connect, disconnect, reconnect)
- Handle rooms, namespaces, and event subscriptions
- Sync real-time events with React state and UI
- Prevent auth-related race conditions on initial connect
- Debug client-side auth and connection issues

## When to use me

Use this skill when you are building authenticated real-time frontend features such as:
- Chat and messaging interfaces
- Live notifications per user or tenant
- Presence and typing indicators
- Real-time dashboards behind auth
- Omnichannel or CRM-like UIs

Ask clarifying questions if:
- Better Auth is used via cookies or access tokens
- Socket authentication happens via headers, auth payload, or cookies
- Tenant or workspace context must be included in the handshake
- Token refresh or session revalidation affects socket reconnects
- The app requires strict disconnect on logout

