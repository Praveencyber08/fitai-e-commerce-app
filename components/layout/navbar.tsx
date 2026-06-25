"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search, Heart, ShoppingBag, User, Sparkles, Menu, Sun, Moon, X, LogOut, Package, LayoutDashboard } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Men", href: "/products?category=men" },
  { label: "Women", href: "/products?category=women" },
  { label: "Kids", href: "/products?category=kids" },
  { label: "Footwear", href: "/products?category=footwear" },
  { label: "Ethnic", href: "/products?category=ethnic" },
  { label: "Accessories", href: "/products?category=accessories" },
]

export function Navbar() {
  const router = useRouter()
  const { cartCount, wishlist, user, logout, hydrated } = useStore()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/products?q=${encodeURIComponent(query)}`)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <Link href="/" className="flex items-center gap-1.5 font-heading text-xl font-extrabold tracking-tight">
          <Sparkles className="size-5 text-primary" />
          <span>
            Fit<span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-sm flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              className="h-10 w-full rounded-md border border-input bg-muted/50 pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring focus:bg-background"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href="/try-on"
            className="hidden items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 sm:flex"
          >
            <Sparkles className="size-4" />
            Try-On
          </Link>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex size-10 items-center justify-center rounded-md text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative flex size-10 items-center justify-center rounded-md text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            <Heart className="size-5" />
            {hydrated && wishlist.length > 0 && (
              <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center px-1 text-[10px]">
                {wishlist.length}
              </Badge>
            )}
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex size-10 items-center justify-center rounded-md text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            <ShoppingBag className="size-5" />
            {hydrated && cartCount > 0 && (
              <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center px-1 text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setAccountOpen((o) => !o)}
              onBlur={() => setTimeout(() => setAccountOpen(false), 150)}
              aria-label="Account"
              className="flex size-10 items-center justify-center rounded-md text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <User className="size-5" />
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg">
                {hydrated && user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    <AccountLink href="/profile" icon={<User className="size-4" />} label="My Profile" />
                    <AccountLink href="/orders" icon={<Package className="size-4" />} label="My Orders" />
                    <AccountLink href="/try-on/history" icon={<Sparkles className="size-4" />} label="Try-On History" />
                    {user.role === "admin" && (
                      <AccountLink href="/admin" icon={<LayoutDashboard className="size-4" />} label="Admin Dashboard" />
                    )}
                    <div className="my-1 h-px bg-border" />
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted"
                    >
                      <LogOut className="size-4" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <AccountLink href="/login" icon={<User className="size-4" />} label="Login" />
                    <AccountLink href="/register" icon={<User className="size-4" />} label="Create account" />
                    <div className="my-1 h-px bg-border" />
                    <AccountLink href="/orders" icon={<Package className="size-4" />} label="Orders" />
                    <AccountLink href="/admin" icon={<LayoutDashboard className="size-4" />} label="Admin" />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* mobile search + nav */}
      <div className={cn("border-t border-border lg:hidden", mobileOpen ? "block" : "hidden")}>
        <div className="space-y-3 px-4 py-4">
          <form onSubmit={onSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="h-10 w-full rounded-md border border-input bg-muted/50 pl-9 pr-3 text-sm outline-none"
              />
            </div>
          </form>
          <div className="grid grid-cols-2 gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/try-on"
              onClick={() => setMobileOpen(false)}
              className="col-span-2 flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"
            >
              <Sparkles className="size-4" /> AI Virtual Try-On
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

function AccountLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
      {icon}
      {label}
    </Link>
  )
}
