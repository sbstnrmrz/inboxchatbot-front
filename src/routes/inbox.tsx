import { InboxPage } from '@/features/inbox/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/inbox')({
  component: RouteComponent,
})

function RouteComponent() {
  return <InboxPage/> 
}
