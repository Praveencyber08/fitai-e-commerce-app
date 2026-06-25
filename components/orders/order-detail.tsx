"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Package, Truck, Home as HomeIcon } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDate } from "@/lib/format"

const STEPS = [
  { key: "processing", label: "Order Placed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Package },
  { key: "out", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: HomeIcon },
]

const STATUS_INDEX: Record<string, number> = {
  processing: 0,
  shipped: 1,
  out: 2,
  delivered: 3,
  cancelled: 0,
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const { orders, hydrated } = useStore()
  const params = useSearchParams()
  const isNew = params.get("new") === "1"
  const order = orders.find((o) => o.id === orderId)

  if (!hydrated) {
    return <div className="py-24 text-center text-muted-foreground">Loading…</div>
  }

  if (!order) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Button asChild className="mt-4">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  const currentStep = STATUS_INDEX[order.status] ?? 0

  return (
    <div className="space-y-6">
      {isNew && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <div>
            <p className="font-semibold">Thank you for your order!</p>
            <p className="text-sm text-muted-foreground">
              A confirmation has been sent. Estimated delivery {formatDate(order.estimatedDelivery)}.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground">Placed on {formatDate(order.placedAt)}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/orders">All orders</Link>
        </Button>
      </div>

      {/* Tracker */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const reached = i <= currentStep
            return (
              <div key={step.key} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : reached ? "bg-primary" : "bg-border"}`} />
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                      reached ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div
                    className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? "bg-transparent" : i < currentStep ? "bg-primary" : "bg-border"}`}
                  />
                </div>
                <span className={`mt-2 text-xs ${reached ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3 rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Items</h2>
          <ul className="divide-y">
            {order.items.map((item, i) => (
              <li key={i} className="flex gap-4 py-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-muted">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-fit space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Delivery Address</h2>
            <div className="mt-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.address.fullName}</p>
              <p>{order.address.line1}</p>
              <p>
                {order.address.city}, {order.address.state} {order.address.pincode}
              </p>
              <p>Phone: {order.address.phone}</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Payment</h2>
            <p className="mt-2 text-sm uppercase text-muted-foreground">{order.paymentMethod}</p>
            <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
              <span>Total Paid</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
