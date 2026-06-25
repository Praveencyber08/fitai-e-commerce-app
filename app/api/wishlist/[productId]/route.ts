import { type NextRequest, NextResponse } from "next/server"
import { isDbConfigured, query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  try {
    const { productId } = await params
    await query("DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2", [user.id, productId])
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] wishlist delete error:", err)
    return NextResponse.json({ error: "Could not remove item." }, { status: 500 })
  }
}
