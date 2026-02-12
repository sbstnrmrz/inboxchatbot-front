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
  const apiUrl = import.meta.env.VITE_API_URL as string
  const protocol = new URL(apiUrl).protocol
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN as string
  return `${protocol}//${slug}.${baseDomain}/inbox`
}
