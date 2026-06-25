import { SiteShell } from "@/components/layout/site-shell"
import { OrdersList } from "@/components/orders/orders-list"

export const metadata = { title: "My Orders — FitAI" }

export default function OrdersPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <OrdersList />
      </div>
    </SiteShell>
  )
}
