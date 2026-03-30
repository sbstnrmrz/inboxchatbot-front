import { env } from '@/lib/env'

/**
 * Determina la URL de redirección después del login basado en el rol del usuario.
 * - superadmin → /admin/dashboard (mismo dominio)
 * - otros roles → subdominio del tenant: {slug}.{host}/inbox
 */
export function getRedirectPathByRole(role?: string): string {
  if (role === "superadmin" || role === "super-admin") {
    return "/admin/dashboard"
  }

  return "/inbox"
}

/**
 * Construye la URL completa del inbox para el tenant usando subdominios.
 * El protocolo se deriva de VITE_API_URL para respetar el entorno (http en dev, https en prod).
 * Ejemplo: slug="acme", VITE_BASE_DOMAIN="localtest.me" → "http://acme.localtest.me/inbox"
 */
export function getTenantInboxUrl(slug: string): string {
  const protocol = new URL(env.VITE_API_URL).protocol
  return `${protocol}//${slug}.${env.VITE_BASE_DOMAIN}/inbox`
}

/**
 * Returns the login URL on the base domain so that after logout the browser
 * is sent away from any tenant subdomain.
 * Ejemplo: VITE_BASE_DOMAIN="localtest.me" → "http://localtest.me/auth/login"
 */
export function getBaseLoginUrl(): string {
  const protocol = new URL(env.VITE_API_URL).protocol
  return `${protocol}//${env.VITE_BASE_DOMAIN}/auth/login`
}
