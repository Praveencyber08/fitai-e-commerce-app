import { Suspense } from "react"
import { SiteShell } from "@/components/layout/site-shell"
import { OrderDetail } from "@/components/orders/order-detail"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Suspense fallback={<div className="py-24 text-center text-muted-foreground">Loading…</div>}>
          <OrderDetail orderId={id} />
        </Suspense>
      </div>
    </SiteShell>
  )
}
