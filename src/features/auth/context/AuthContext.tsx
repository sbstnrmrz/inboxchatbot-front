import { createContext, useContext } from "react"
import { authClient } from "@/lib/auth-client"

// Inferir tipos directamente de Better Auth
type Session = typeof authClient.$Infer.Session

interface AuthContextType {
  session: Session | null
  isPending: boolean
  isRefetching: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Usar el hook nativo de Better Auth
  const { data: session, isPending, isRefetching, error, refetch } = authClient.useSession()

  const signOut = async () => {
    await authClient.signOut()
    // Better Auth maneja automáticamente la actualización del estado
  }

  const value: AuthContextType = {
    session: session || null,
    isPending,
    isRefetching,
    isAuthenticated: !!session,
    signOut,
    refetch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
