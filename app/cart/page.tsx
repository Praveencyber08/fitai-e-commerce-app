import { SiteShell } from "@/components/layout/site-shell"
import { CartClient } from "@/components/cart/cart-client"

export const metadata = { title: "Shopping Bag — FitAI" }

export default function CartPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <CartClient />
      </div>
    </SiteShell>
  )
}
