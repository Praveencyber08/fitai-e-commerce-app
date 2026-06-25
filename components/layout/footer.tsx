import Link from "next/link"
import { Sparkles } from "lucide-react"

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Men", href: "/products?category=men" },
      { label: "Women", href: "/products?category=women" },
      { label: "Footwear", href: "/products?category=footwear" },
      { label: "Ethnic", href: "/products?category=ethnic" },
    ],
  },
  {
    title: "Experience",
    links: [
      { label: "AI Virtual Try-On", href: "/try-on" },
      { label: "Try-On History", href: "/try-on/history" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Track Order", href: "/orders" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "My Profile", href: "/profile" },
      { label: "Admin", href: "/admin" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-1.5 font-heading text-xl font-extrabold">
              <Sparkles className="size-5 text-primary" />
              Fit<span className="text-primary">AI</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Premium fashion meets AI. Preview how every outfit looks on you before you buy with our virtual try-on
              studio.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} FitAI. All rights reserved.</p>
          <p>Built with Next.js · Aurora DSQL · AI Gateway</p>
        </div>
      </div>
    </footer>
  )
}
