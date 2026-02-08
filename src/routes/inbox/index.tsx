import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Inbox,
})

function Inbox() {
  return (
    <div className="p-2">
      <h3>Welcome inbox!</h3>
    </div>
  )
}
