import { AuthForm } from "@/components/auth/auth-form"

export const metadata = { title: "Create Account — FitAI" }

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <AuthForm mode="register" />
    </main>
  )
}
