import { type NextRequest, NextResponse } from "next/server"
import { isDbConfigured, query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { mapOrder, type OrderRow, type OrderItemRow } from "@/lib/mappers"

export const runtime = "nodejs"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  try {
    const { id } = await params
    const orders = await query<OrderRow>("SELECT * FROM orders WHERE id = $1", [id])
    const order = orders.rows[0]
    // App-layer scoping: only the owner (or an admin) may view the order.
    if (!order || (order.user_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }
    const items = await query<OrderItemRow>("SELECT * FROM order_items WHERE order_id = $1", [id])
    return NextResponse.json({ order: mapOrder(order, items.rows) })
  } catch (err) {
    console.error("[v0] order detail error:", err)
    return NextResponse.json({ error: "Could not load order." }, { status: 500 })
  }
}
