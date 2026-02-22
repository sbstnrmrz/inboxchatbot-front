import { createFileRoute } from '@tanstack/react-router'
import { ContactsPage } from '@/features/inbox/components/contacts/ContactsPage'

export const Route = createFileRoute('/inbox/contacts/')({
  component: ContactsPage,
})
