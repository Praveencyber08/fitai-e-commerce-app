import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { isDbConfigured, query } from "@/lib/db"
import { mapProduct } from "@/lib/mappers"
import type { ProductRow } from "@/lib/mappers"

export const runtime = "nodejs"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, brand, description, category, subCategory, price, mrp, sizes, colors, image, isTrending, isNew } = body

    const updates: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(String(name).trim())
    }
    if (brand !== undefined) {
      updates.push(`brand = $${paramIndex++}`)
      values.push(String(brand).trim())
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(description ? String(description).trim() : null)
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`)
      values.push(String(category).trim())
    }
    if (subCategory !== undefined) {
      updates.push(`sub_category = $${paramIndex++}`)
      values.push(subCategory ? String(subCategory).trim() : null)
    }
    if (price !== undefined) {
      updates.push(`price = $${paramIndex++}`)
      values.push(Number(price))
    }
    if (mrp !== undefined) {
      updates.push(`mrp = $${paramIndex++}`)
      values.push(Number(mrp))
    }
    if (image !== undefined) {
      updates.push(`image = $${paramIndex++}`)
      values.push(String(image).trim())
    }
    if (sizes !== undefined) {
      updates.push(`sizes = $${paramIndex++}`)
      values.push(sizes && Array.isArray(sizes) ? sizes.join(",") : null)
    }
    if (colors !== undefined) {
      updates.push(`colors = $${paramIndex++}`)
      values.push(colors && Array.isArray(colors) ? colors.join(",") : null)
    }
    if (isTrending !== undefined) {
      updates.push(`is_trending = $${paramIndex++}`)
      values.push(Boolean(isTrending))
    }
    if (isNew !== undefined) {
      updates.push(`is_new = $${paramIndex++}`)
      values.push(Boolean(isNew))
    }

    if (!updates.length) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 })
    }

    values.push(id)
    const sql = `UPDATE products SET ${updates.join(", ")} WHERE id = $${paramIndex++} 
                 RETURNING id, name, brand, description, category, sub_category, price, mrp, discount_percent,
                           rating, rating_count, image, images, sizes, colors, tags, stock, in_stock, is_trending, is_new`

    const result = await query<ProductRow>(sql, values)
    if (!result.rows.length) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ product: mapProduct(result.rows[0]) })
  } catch (err) {
    console.error("[v0] admin update product error:", err)
    return NextResponse.json({ error: "Could not update product." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 })
    }

    const { id } = await params

    await query("DELETE FROM cart_items WHERE product_id = $1", [id])
    await query("DELETE FROM wishlist_items WHERE product_id = $1", [id])
    await query("DELETE FROM products WHERE id = $1", [id])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] admin delete product error:", err)
    return NextResponse.json({ error: "Could not delete product." }, { status: 500 })
  }
}
