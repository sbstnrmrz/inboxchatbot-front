import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: `${env.VITE_API_URL}/auth`,
  plugins: [
    adminClient(),
  ],
});
