import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  basePath: '/auth',
  baseURL: import.meta.env.VITE_API_URL || "http://localtest.me:3001",
  plugins: [
    adminClient(),
  ],
});
