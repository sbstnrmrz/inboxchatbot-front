/**
 * Centralized environment variable validation.
 *
 * All VITE_ variables are resolved at build time by Vite.
 * If a required variable is missing the app throws immediately
 * so the error surfaces during build/startup rather than silently
 * falling back to a development URL in production.
 */

function requireEnv(key: string): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Make sure it is defined in your .env file or injected as a build arg.`
    )
  }
  return value as string
}

export const env = {
  VITE_API_URL: requireEnv("VITE_API_URL"),
} as const
