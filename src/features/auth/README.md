# Authentication Feature

Sistema de autenticación implementado con Better Auth para el frontend.

## Estructura

```
src/features/auth/
├── components/
│   ├── LoginForm.tsx          # Formulario de inicio de sesión
│   ├── UserMenu.tsx           # Menú de usuario con logout
│   ├── ProtectedRoute.tsx     # HOC para proteger rutas
│   └── index.ts              # Barrel exports
├── context/
│   ├── AuthContext.tsx        # Contexto de autenticación
│   └── index.ts              # Barrel exports
├── schemas/
│   └── login.schema.ts        # Validación Zod para login
└── README.md
```

## Uso del AuthContext

### Hook `useAuth()`

El hook `useAuth()` proporciona acceso al estado de autenticación en cualquier componente:

```tsx
import { useAuth } from "@/features/auth/context"

function MyComponent() {
  const { 
    session,        // Sesión actual (tipada con Better Auth)
    user,           // Usuario actual
    isAuthenticated,// Boolean si está autenticado
    isPending,      // Loading inicial
    isRefetching,   // Loading de refetch
    signOut,        // Función para cerrar sesión
    refetch         // Función para refrescar sesión
  } = useAuth()

  if (isPending) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated) {
    return <div>No autenticado</div>
  }

  return (
    <div>
      <p>Hola {session?.user.email}</p>
      <button onClick={signOut}>Cerrar sesión</button>
    </div>
  )
}
```

## Proteger Rutas

### Método 1: Usando `beforeLoad` (Recomendado)

```tsx
// src/routes/dashboard/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()
    if (!data) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: Dashboard,
})
```

### Método 2: Usando componente `ProtectedRoute`

```tsx
import { ProtectedRoute } from "@/features/auth/components"

function MyProtectedPage() {
  return (
    <ProtectedRoute redirectTo="/auth/login">
      <div>Contenido protegido</div>
    </ProtectedRoute>
  )
}
```

## Componentes Disponibles

### LoginForm

Formulario de inicio de sesión completo con validación.

```tsx
import { LoginForm } from "@/features/auth/components"

function LoginPage() {
  return <LoginForm />
}
```

### UserMenu

Menú de usuario con email y botón de logout.

```tsx
import { UserMenu } from "@/features/auth/components"

function Header() {
  return (
    <header>
      <h1>Mi App</h1>
      <UserMenu />
    </header>
  )
}
```

## Flujo de Autenticación

1. **Usuario no autenticado** → Redirige a `/auth/login`
2. **Usuario ingresa credenciales** → `LoginForm` valida con Zod
3. **Credenciales válidas** → `authClient.signIn.email()` autentica
4. **Sesión creada** → `refetch()` actualiza el contexto
5. **Redirección** → Navega a `/inbox`
6. **Rutas protegidas** → `beforeLoad` verifica sesión
7. **Logout** → `signOut()` + redirección a login

## Configuración

### Variables de entorno

```env
VITE_API_URL=http://localtest.me:3001
```

### AuthClient

El cliente de Better Auth está configurado en `src/lib/auth-client.ts`:

```tsx
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
})
```

## Tipos

Better Auth proporciona tipos automáticos. Para inferir el tipo de sesión:

```tsx
type Session = typeof authClient.$Infer.Session
```

El `AuthContext` ya usa estos tipos internamente.

## Mejores Prácticas

1. ✅ **Siempre usar `useAuth()` dentro del AuthProvider**
2. ✅ **Proteger rutas con `beforeLoad` en TanStack Router**
3. ✅ **Usar `refetch()` después de operaciones que modifiquen la sesión**
4. ✅ **Manejar estados de loading (`isPending`, `isRefetching`)**
5. ✅ **Validar formularios con Zod antes de enviar**

## Troubleshooting

### "useAuth must be used within an AuthProvider"

Asegúrate de que `AuthProvider` esté en `__root.tsx`:

```tsx
// src/routes/__root.tsx
import { AuthProvider } from '@/features/auth/context'

const RootLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
)
```

### La sesión no se actualiza después del login

Asegúrate de llamar `refetch()` después de un login exitoso:

```tsx
await authClient.signIn.email({ email, password })
await refetch() // ← Importante
navigate({ to: '/inbox' })
```

### Redirección infinita

Verifica que la ruta de login NO esté protegida, y que tenga un guard para redirigir si YA está autenticado.
