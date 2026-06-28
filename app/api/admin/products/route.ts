import { type NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { getCurrentUser } from "@/lib/auth"
import { isDbConfigured, query, withConnection } from "@/lib/db"
import { mapProduct } from "@/lib/mappers"
import type { ProductRow } from "@/lib/mappers"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, category, price, stock, image_url } = body

    if (!name || !category || !price) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    const id = nanoid()
    const result = await query<ProductRow>(
      `INSERT INTO products (
        id, name, description, category, price, stock, image_url, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, name, description, category, price, image_url, stock, created_at`,
      [
        id,
        String(name).trim(),
        description ? String(description).trim() : null,
        String(category).trim(),
        Number(price),
        Number(stock) || 0,
        image_url ? String(image_url).trim() : null,
      ],
    )

    return NextResponse.json({ product: mapProduct(result.rows[0]) })
  } catch (err) {
    console.error("[v0] admin create product error:", err)
    return NextResponse.json({ error: "Could not create product." }, { status: 500 })
  }
}
