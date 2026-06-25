"use client"

import { useState } from "react"
import { ADMIN_ORDERS } from "@/lib/data/admin"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"

const FILTERS: ("all" | OrderStatus)[] = [
  "all",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
]

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  delivered: "default",
  shipped: "secondary",
  out_for_delivery: "secondary",
  processing: "outline",
  cancelled: "outline",
}

export function AdminOrdersTable() {
  const [filter, setFilter] = useState<"all" | OrderStatus>("all")
  const filtered = filter === "all" ? ADMIN_ORDERS : ADMIN_ORDERS.filter((o) => o.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">{ADMIN_ORDERS.length} total orders</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="px-5 py-3 font-medium">#{o.id}</td>
                  <td className="px-5 py-3">{o.address.fullName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.items.length}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(o.placedAt)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.paymentMethod}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant[o.status]} className="capitalize">
                      {o.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
