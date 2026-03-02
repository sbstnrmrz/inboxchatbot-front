import { createFileRoute } from '@tanstack/react-router'
import { ContactsPage } from '@/features/inbox/components/contacts/ContactsPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export const Route = createFileRoute('/inbox/contacts/')({
  component: Contacts,
})

function Contacts() {
  usePageTitle('Contactos')
  return <ContactsPage />
}
