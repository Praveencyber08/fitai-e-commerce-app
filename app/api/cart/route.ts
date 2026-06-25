import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { isDbConfigured, query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { getProductsByIds, productExists } from "@/lib/queries"

export const runtime = "nodejs"

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ items: [] })
  try {
    const rows = await query<{ product_id: string; size: string; quantity: number }>(
      "SELECT product_id, size, quantity FROM cart_items WHERE user_id = $1 ORDER BY created_at",
      [user.id],
    )
    const products = await getProductsByIds(rows.rows.map((r) => r.product_id))
    const byId = new Map(products.map((p) => [p.id, p]))
    const items = rows.rows
      .filter((r) => byId.has(r.product_id))
      .map((r) => ({ product: byId.get(r.product_id)!, size: r.size, quantity: r.quantity }))
    return NextResponse.json({ items })
  } catch (err) {
    console.error("[v0] cart get error:", err)
    return NextResponse.json({ error: "Could not load cart." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Sign in to add to cart." }, { status: 401 })
  try {
    const { productId, size, quantity = 1 } = await req.json()
    if (!productId || !size) return NextResponse.json({ error: "productId and size are required." }, { status: 400 })
    if (!(await productExists(productId))) return NextResponse.json({ error: "Product not found." }, { status: 404 })

    const existing = await query<{ id: string; quantity: number }>(
      "SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3",
      [user.id, productId, size],
    )
    if (existing.rows[0]) {
      await query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
        existing.rows[0].quantity + quantity,
        existing.rows[0].id,
      ])
    } else {
      await query("INSERT INTO cart_items (id, user_id, product_id, size, quantity) VALUES ($1,$2,$3,$4,$5)", [
        randomUUID(),
        user.id,
        productId,
        size,
        quantity,
      ])
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] cart add error:", err)
    return NextResponse.json({ error: "Could not add to cart." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  try {
    const { productId, size, quantity } = await req.json()
    if (!productId || !size || typeof quantity !== "number") {
      return NextResponse.json({ error: "productId, size and quantity are required." }, { status: 400 })
    }
    if (quantity <= 0) {
      await query("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3", [
        user.id,
        productId,
        size,
      ])
    } else {
      await query("UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 AND size = $4", [
        quantity,
        user.id,
        productId,
        size,
      ])
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] cart update error:", err)
    return NextResponse.json({ error: "Could not update cart." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")
    const size = searchParams.get("size")
    if (productId && size) {
      await query("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3", [
        user.id,
        productId,
        size,
      ])
    } else {
      // Clear entire cart.
      await query("DELETE FROM cart_items WHERE user_id = $1", [user.id])
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] cart delete error:", err)
    return NextResponse.json({ error: "Could not remove item." }, { status: 500 })
  }
}
