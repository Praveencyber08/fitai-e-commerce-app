"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { ADMIN_ORDERS } from "@/lib/data/admin"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDate } from "@/lib/format"
import { fetcher } from "@/lib/fetcher"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/providers/toast-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Order, OrderStatus } from "@/lib/types"

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
  const { toast } = useToast()
  const [filter, setFilter] = useState<"all" | OrderStatus>("all")
  const [updating, setUpdating] = useState<string | null>(null)
  const { data } = useSWR<{ orders: Order[]; dbConfigured: boolean }>("/api/admin/orders", fetcher)

  const orders = data?.orders && data.orders.length > 0 ? data.orders : ADMIN_ORDERS
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter)

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update")
      await mutate("/api/admin/orders")
      toast("Order status updated", "success")
    } catch (error) {
      console.error("[v0] update error:", error)
      toast("Failed to update order", "error")
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
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
                    <Select
                      value={o.status}
                      onValueChange={(value) => updateOrderStatus(o.id, value as OrderStatus)}
                      disabled={updating === o.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
