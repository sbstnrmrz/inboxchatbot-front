import { LoginForm } from "@/features/auth/components/LoginForm"
import { createFileRoute } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"

export const Route = createFileRoute('/auth/login')({
  component: Login,
})

function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
      <Toaster/>
    </div>
  )

}

