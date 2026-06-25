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
    const rows = await query<{ product_id: string }>(
      "SELECT product_id FROM wishlist_items WHERE user_id = $1 ORDER BY created_at DESC",
      [user.id],
    )
    const products = await getProductsByIds(rows.rows.map((r) => r.product_id))
    return NextResponse.json({ items: products.map((product) => ({ product })) })
  } catch (err) {
    console.error("[v0] wishlist get error:", err)
    return NextResponse.json({ error: "Could not load wishlist." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Sign in to save items." }, { status: 401 })
  try {
    const { productId } = await req.json()
    if (!productId) return NextResponse.json({ error: "productId is required." }, { status: 400 })
    if (!(await productExists(productId))) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }
    const existing = await query("SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2", [
      user.id,
      productId,
    ])
    if (existing.rows.length === 0) {
      await query("INSERT INTO wishlist_items (id, user_id, product_id) VALUES ($1, $2, $3)", [
        randomUUID(),
        user.id,
        productId,
      ])
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] wishlist add error:", err)
    return NextResponse.json({ error: "Could not add to wishlist." }, { status: 500 })
  }
}
