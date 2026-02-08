import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  basePath: '/auth',
  baseURL: import.meta.env.VITE_API_URL || "http://localtest.me:3001",
});
