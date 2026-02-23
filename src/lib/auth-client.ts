import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { env } from "@/lib/env"

export const authClient = createAuthClient({
  basePath: '/auth',
  baseURL: env.VITE_API_URL,
  plugins: [
    adminClient(),
  ],
});
