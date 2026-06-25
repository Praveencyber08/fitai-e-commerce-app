"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, Heart, Sparkles, LogOut, User as UserIcon, ShieldCheck } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"

export function ProfileClient() {
  const { user, orders, wishlist, tryOnHistory, logout, hydrated } = useStore()
  const router = useRouter()

  if (!hydrated) {
    return <div className="py-24 text-center text-muted-foreground">Loading…</div>
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <UserIcon className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">You&apos;re not signed in</h2>
        <p className="max-w-sm text-sm text-muted-foreground">Sign in to view your profile, orders, and saved styles.</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Orders", value: orders.length, href: "/orders", icon: Package },
    { label: "Wishlist", value: wishlist.length, href: "/wishlist", icon: Heart },
    { label: "Try-Ons", value: tryOnHistory.length, href: "/try-on", icon: Sparkles },
  ]

  async function handleLogout() {
    await logout()
    router.push("/")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">Member since {formatDate(user.joinedAt)}</p>
        </div>
        {user.role === "admin" && (
          <Button asChild variant="outline">
            <Link href="/admin">
              <ShieldCheck className="mr-1 h-4 w-4" /> Admin Dashboard
            </Link>
          </Button>
        )}
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-1 h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              href={s.href}
              className="flex items-center gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
