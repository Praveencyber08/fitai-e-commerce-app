"use client"

import Link from "next/link"
import Image from "next/image"
import { Package, ChevronRight } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDate } from "@/lib/format"

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  delivered: "default",
  shipped: "secondary",
  processing: "outline",
  cancelled: "outline",
}

export function OrdersList() {
  const { orders, hydrated } = useStore()

  if (hydrated && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Package className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">No orders yet</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          When you place an order, it will appear here so you can track it.
        </p>
        <Button asChild>
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex -space-x-3">
                {order.items.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="relative h-14 w-12 overflow-hidden rounded border-2 border-card bg-muted"
                  >
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="48px" />
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">#{order.id}</p>
                  <Badge variant={statusVariant[order.status]} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"} · Placed {formatDate(order.placedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(order.total)}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
