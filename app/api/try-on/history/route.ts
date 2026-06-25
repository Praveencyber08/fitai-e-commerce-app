import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { isDbConfigured, query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import type { TryOnResult } from "@/lib/types"

export const runtime = "nodejs"

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ items: [] })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ items: [] })
  try {
    const rows = await query<{
      id: string
      product_id: string | null
      product_name: string | null
      result_image: string | null
      created_at: string
    }>("SELECT id, product_id, product_name, result_image, created_at FROM try_on_history WHERE user_id = $1 ORDER BY created_at DESC", [user.id])

    const items: TryOnResult[] = rows.rows.map((r) => ({
      id: r.id,
      productId: r.product_id ?? "",
      productName: r.product_name ?? "",
      resultImage: r.result_image ?? "",
      createdAt: typeof r.created_at === "string" ? r.created_at : new Date(r.created_at).toISOString(),
    }))
    return NextResponse.json({ items })
  } catch (err) {
    console.error("[v0] tryon history get error:", err)
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Sign in to save try-on results." }, { status: 401 })
  try {
    const { productId, productName, resultImage } = await req.json()
    if (!resultImage) return NextResponse.json({ error: "resultImage is required." }, { status: 400 })
    const id = randomUUID()
    await query(
      "INSERT INTO try_on_history (id, user_id, product_id, product_name, result_image) VALUES ($1,$2,$3,$4,$5)",
      [id, user.id, productId ?? null, productName ?? null, resultImage],
    )
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error("[v0] tryon history save error:", err)
    return NextResponse.json({ error: "Could not save result." }, { status: 500 })
  }
}
