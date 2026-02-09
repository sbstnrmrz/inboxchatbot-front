import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { InboxLayout } from '@/features/inbox/components/InboxLayout'

export const Route = createFileRoute('/inbox/')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()
    if (!data) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: InboxLayout,
})
