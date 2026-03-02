/**
 * usePageTitle — sets document.title reactively.
 *
 * Format: "<tenantSlug> - <section>" when running on a tenant subdomain,
 * otherwise just "<section>".
 *
 * The tenant slug is derived from the subdomain of the current hostname.
 * Example: "acme.localtest.me" → slug = "acme" → title = "acme - Inbox"
 */

import { useEffect } from "react"
import { env } from "@/lib/env"

function getTenantSlug(): string | undefined {
  const host = window.location.hostname
  const baseDomain = env.VITE_BASE_DOMAIN
  if (host === baseDomain || !host.endsWith(`.${baseDomain}`)) return undefined
  return host.slice(0, host.length - baseDomain.length - 1)
}

export function usePageTitle(section: string) {
  useEffect(() => {
    const slug = getTenantSlug()
    document.title = slug ? `${slug} - ${section}` : section
  }, [section])
}
