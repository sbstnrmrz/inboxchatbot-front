import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "@/features/auth/schemas/login.schema"
import { authClient } from "@/lib/auth-client"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { useAuth } from "@/features/auth/context"
import { getRedirectPathByRole } from "@/features/auth/utils/getRedirectPath"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, setIsPending] = useState(false)
  const navigate = useNavigate()
  const { refetch } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsPending(true)
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        toast.error(result.error.message || "Error al iniciar sesión")
        return
      }

      // Refrescar la sesión en el contexto
      await refetch()

      // Obtener la sesión actualizada para determinar el rol
      const { data: sessionData } = await authClient.getSession()
      const userRole = sessionData?.user?.role ?? undefined

      // Determinar la ruta de redirección según el rol
      const redirectPath = getRedirectPathByRole(userRole)

      toast.success("Inicio de sesión exitoso")
      navigate({ to: redirectPath as any })
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error)
      toast.error("Ocurrió un error inesperado. Intenta de nuevo.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Iniciar sesión</h1>
                <p className="text-muted-foreground text-balance">
                  Inicia sesión en Crazy Imagine Chatbot
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register("email")}
                />
                {errors.email && (
                  <FieldDescription className="text-destructive">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <PasswordInput
                  id="password"
                  {...register("password")}
                />
                {errors.password && (
                  <FieldDescription className="text-destructive">
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
