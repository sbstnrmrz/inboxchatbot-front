import { useAuth } from "@/features/auth/context"
import { getBaseLoginUrl } from "@/features/auth/utils/getRedirectPath"
import { Button } from "@/components/ui/button"
import { LogOut, MoonIcon, SunIcon, User } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "next-themes"

export function UserMenu() {
  const { session, signOut, isAuthenticated } = useAuth()
  const {theme, setTheme} = useTheme();

  if (!isAuthenticated || !session) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Sesión cerrada exitosamente")
      window.location.href = getBaseLoginUrl()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{session.user.email}</span>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar sesión
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleSignOut}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        Change Theme 
      </Button>
    </div>
  )
}
