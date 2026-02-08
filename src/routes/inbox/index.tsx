import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { useAuth } from '@/features/auth/context'
import { UserMenu } from '@/features/auth/components/UserMenu'

export const Route = createFileRoute('/inbox/')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()
    if (!data) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: Inbox,
})

function Inbox() {
  const { session } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Inbox</h1>
          <UserMenu />
        </div>
      </header>
      <main className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">
              ¡Bienvenido, {session?.user.email}!
            </h2>
            <p className="text-muted-foreground">
              Estás autenticado correctamente en el sistema.
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Esta es tu bandeja de entrada. Aquí podrás gestionar todas tus conversaciones.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
