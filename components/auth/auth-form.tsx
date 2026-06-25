"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, Eye, EyeOff } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button } from "@/components/ui/button"

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useStore()
  const { toast } = useToast()
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const isLogin = mode === "login"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = isLogin ? await login(email, password) : await register(name, email, password)
    setSubmitting(false)
    if (!result.ok) {
      toast(result.error ?? "Something went wrong.", "error")
      return
    }
    toast(isLogin ? "Welcome back!" : "Account created!", "success")
    router.push(result.user?.role === "admin" ? "/admin" : "/")
  }

  const field =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">FitAI</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLogin ? "Sign in to continue shopping" : "Join FitAI and try clothes on with AI"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              required
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              required
              minLength={6}
              className={field}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? "New to FitAI? " : "Already have an account? "}
        <Link href={isLogin ? "/register" : "/login"} className="font-medium text-primary hover:underline">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>

      <p className="mt-4 rounded-md bg-muted p-3 text-center text-xs text-muted-foreground">
        Tip: sign in with <span className="font-medium text-foreground">admin@fitai.com</span> /{" "}
        <span className="font-medium text-foreground">admin123</span> to access the admin dashboard.
      </p>
    </div>
  )
}
