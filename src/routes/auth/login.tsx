import { LoginForm } from "@/features/auth/components/LoginForm"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"
import { authClient } from "@/lib/auth-client"
import { env } from "@/lib/env"
import { getBaseLoginUrl } from "@/features/auth/utils/getRedirectPath"

export const Route = createFileRoute('/auth/login')({
  head: () => ({ meta: [{ title: 'Iniciar sesión' }] }),
  beforeLoad: async () => {
    // If accessed from a tenant subdomain, redirect to the base domain login
    const baseDomain = env.VITE_BASE_DOMAIN
    const currentHost = window.location.host
    if (currentHost !== baseDomain) {
      window.location.href = getBaseLoginUrl()
      return
    }

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

