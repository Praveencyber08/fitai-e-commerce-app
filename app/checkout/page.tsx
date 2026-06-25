import { SiteShell } from "@/components/layout/site-shell"
import { CheckoutClient } from "@/components/checkout/checkout-client"

export const metadata = { title: "Checkout — FitAI" }

export default function CheckoutPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Checkout</h1>
        <CheckoutClient />
      </div>
    </SiteShell>
  )
}
