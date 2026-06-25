import { AuthForm } from "@/components/auth/auth-form"

export const metadata = { title: "Sign In — FitAI" }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <AuthForm mode="login" />
    </main>
  )
}
