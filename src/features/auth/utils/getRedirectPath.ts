/**
 * Determina la ruta de redirección después del login basado en el rol del usuario
 * Solo el superadmin es redirigido a /admin/dashboard
 * Todos los demás roles van a /inbox
 */
export function getRedirectPathByRole(role?: string): string {
  if (role === "superadmin" || role === "super-admin") {
    return "/admin/dashboard"
  }
  
  return "/inbox"
}
