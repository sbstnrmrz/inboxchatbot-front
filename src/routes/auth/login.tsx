import { LoginForm } from "@/features/auth/components/LoginForm"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute('/auth/login')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()
    if (data) {
      // Si ya está autenticado, redirigir al inbox
      throw redirect({ to: '/inbox' })
    }
  },
  component: Login,
})

function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>

    </div>
  )

}

