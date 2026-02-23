import { createFileRoute, getRouteApi, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { InboxLayout } from '@/features/inbox/components/inbox-layout'
import { tenantsQueries } from '@/features/admin/api/tenants.queries'
import { getTenantInboxUrl } from '@/features/auth/utils/getRedirectPath'
import { logger } from '@/lib/logger'
import z from 'zod'


const inboxSearchSchema = z.object({
  conversationId: z.string().optional(),
})

type InboxSearch = z.infer<typeof inboxSearchSchema>

export const Route = createFileRoute('/inbox/')({
  validateSearch: (search) => inboxSearchSchema.parse(search), 
  beforeLoad: async () => {
    const { data } = await authClient.getSession()
    if (!data) {
      throw redirect({ to: '/auth/login' })
    }

    const baseDomain = import.meta.env.VITE_BASE_DOMAIN as string
    const currentHost = window.location.host

    // Si estamos en el dominio base (sin subdominio del tenant), redirigir al subdominio
    if (currentHost === baseDomain) {
      const tenantId = (data.user as any)?.tenantId as string | undefined
      if (tenantId) {
        const tenant = await tenantsQueries.getById(tenantId)
        throw redirect({ href: getTenantInboxUrl(tenant.slug) })
      }
    }
  },
  component: Inbox,
})

function Inbox() {
  const { conversationId } = Route.useSearch()
  logger.debug('conversation id: ' + conversationId);


  return (
    <InboxLayout conversationId={conversationId}/>
  )
}
