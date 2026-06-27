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
    const { name, brand, description, category, subCategory, price, mrp, sizes, colors, image } = body

    if (!name || !brand || !category || !price) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    const id = nanoid()
    const result = await query<ProductRow>(
      `INSERT INTO products (
        id, name, brand, description, category, sub_category, price, mrp, discount_percent,
        image, sizes, colors, in_stock, is_trending, is_new, rating, rating_count, stock
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, name, brand, description, category, sub_category, price, mrp, discount_percent,
                rating, rating_count, image, images, sizes, colors, tags, stock, in_stock, is_trending, is_new`,
      [
        id,
        String(name).trim(),
        String(brand).trim(),
        description ? String(description).trim() : null,
        String(category).trim(),
        subCategory ? String(subCategory).trim() : null,
        Number(price),
        Number(mrp) || Number(price),
        Math.round(((Number(mrp) || Number(price)) - Number(price)) / (Number(mrp) || Number(price)) * 100) || 0,
        String(image).trim(),
        sizes && Array.isArray(sizes) ? sizes.join(",") : null,
        colors && Array.isArray(colors) ? colors.join(",") : null,
        true,
        false,
        true,
        0,
        0,
        10,
      ],
    )

    return NextResponse.json({ product: mapProduct(result.rows[0]) })
  } catch (err) {
    console.error("[v0] admin create product error:", err)
    return NextResponse.json({ error: "Could not create product." }, { status: 500 })
  }
}
