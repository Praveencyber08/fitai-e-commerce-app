import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { isDbConfigured, query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { getProductsByIds } from "@/lib/queries"
import { mapOrder, type OrderRow, type OrderItemRow } from "@/lib/mappers"

export const runtime = "nodejs"

const FREE_SHIPPING_THRESHOLD = 1999
const SHIPPING_FEE = 99

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ orders: [] })
  try {
    const orders = await query<OrderRow>(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [user.id],
    )
    if (orders.rows.length === 0) return NextResponse.json({ orders: [] })

    const ids = orders.rows.map((o) => o.id)
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",")
    const items = await query<OrderItemRow>(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      ids,
    )
    const itemsByOrder = new Map<string, OrderItemRow[]>()
    for (const item of items.rows) {
      const arr = itemsByOrder.get(item.order_id) ?? []
      arr.push(item)
      itemsByOrder.set(item.order_id, arr)
    }
    return NextResponse.json({
      orders: orders.rows.map((o) => mapOrder(o, itemsByOrder.get(o.id) ?? [])),
    })
  } catch (err) {
    console.error("[v0] orders get error:", err)
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Sign in to place an order." }, { status: 401 })
  try {
    const { address, paymentMethod } = await req.json()
    if (!address?.fullName || !address?.line1 || !address?.city || !address?.pincode) {
      return NextResponse.json({ error: "Complete delivery address is required." }, { status: 400 })
    }

    const cart = await query<{ product_id: string; size: string; quantity: number }>(
      "SELECT product_id, size, quantity FROM cart_items WHERE user_id = $1",
      [user.id],
    )
    if (cart.rows.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 })

    const products = await getProductsByIds(cart.rows.map((r) => r.product_id))
    const byId = new Map(products.map((p) => [p.id, p]))

    let subtotal = 0
    const lineItems = cart.rows
      .filter((r) => byId.has(r.product_id))
      .map((r) => {
        const product = byId.get(r.product_id)!
        subtotal += product.price * r.quantity
        return { product, size: r.size, quantity: r.quantity }
      })

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const total = subtotal + shipping
    const orderId = randomUUID()

    await query(
      `INSERT INTO orders
        (id, user_id, status, subtotal, shipping, total, payment_method,
         address_name, address_line, address_city, address_state, address_pincode, address_phone)
       VALUES ($1,$2,'processing',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        orderId,
        user.id,
        subtotal,
        shipping,
        total,
        paymentMethod || "Cash on Delivery",
        address.fullName,
        `${address.line1}${address.line2 ? ", " + address.line2 : ""}`,
        address.city,
        address.state ?? "",
        address.pincode,
        address.phone ?? "",
      ],
    )

    for (const li of lineItems) {
      await query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, size, quantity, price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [randomUUID(), orderId, li.product.id, li.product.name, li.product.image, li.size, li.quantity, li.product.price],
      )
    }

    await query("DELETE FROM cart_items WHERE user_id = $1", [user.id])
    return NextResponse.json({ orderId }, { status: 201 })
  } catch (err) {
    console.error("[v0] order create error:", err)
    return NextResponse.json({ error: "Could not place order." }, { status: 500 })
  }
}
