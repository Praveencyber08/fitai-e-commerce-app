import { NextRequest, NextResponse } from "next/server"
import { query, isDbConfigured } from "@/lib/db"

interface ProductRow {
  id: string
  name: string
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { products } = body

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    let updated = 0
    for (const product of products) {
      await query("UPDATE products SET image_url = $1 WHERE name = $2", [product.image, product.name])
      updated++
    }

    return NextResponse.json({ updated })
  } catch (err) {
    console.error("[v0] update products images error:", err)
    return NextResponse.json({ error: "Could not update images." }, { status: 500 })
  }
}
