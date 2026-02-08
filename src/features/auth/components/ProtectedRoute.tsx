import { useAuth } from "@/features/auth/context"
import { Navigate } from "@tanstack/react-router"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  redirectTo = "/auth/login" 
}: ProtectedRouteProps) {
  const { isAuthenticated, isPending } = useAuth()

  if (isPending) {
    // Mostrar un loader mientras se verifica la sesión
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />
  }

  return <>{children}</>
}
