import { type NextRequest, NextResponse } from "next/server"
import { isDbConfigured, query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { mapOrder, type OrderRow, type OrderItemRow } from "@/lib/mappers"

export const runtime = "nodejs"

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  try {
    const orders = await query<OrderRow>("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200")
    if (orders.rows.length === 0) return NextResponse.json({ orders: [] })
    const ids = orders.rows.map((o) => o.id)
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",")
    const items = await query<OrderItemRow>(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, ids)
    const byOrder = new Map<string, OrderItemRow[]>()
    for (const it of items.rows) {
      const arr = byOrder.get(it.order_id) ?? []
      arr.push(it)
      byOrder.set(it.order_id, arr)
    }
    return NextResponse.json({ orders: orders.rows.map((o) => mapOrder(o, byOrder.get(o.id) ?? [])) })
  } catch (err) {
    console.error("[v0] admin orders error:", err)
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  try {
    const { orderId, status } = await req.json()
    const allowed = ["processing", "shipped", "out_for_delivery", "delivered", "cancelled"]
    if (!orderId || !allowed.includes(status)) {
      return NextResponse.json({ error: "Valid orderId and status are required." }, { status: 400 })
    }
    await query("UPDATE orders SET status = $1 WHERE id = $2", [status, orderId])
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] admin order update error:", err)
    return NextResponse.json({ error: "Could not update order." }, { status: 500 })
  }
}
