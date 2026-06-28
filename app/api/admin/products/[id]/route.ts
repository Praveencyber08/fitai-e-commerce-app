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
    const { name, description, category, price, stock, image_url } = body

    const updates: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(String(name).trim())
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(description ? String(description).trim() : null)
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`)
      values.push(String(category).trim())
    }
    if (price !== undefined) {
      updates.push(`price = $${paramIndex++}`)
      values.push(Number(price))
    }
    if (stock !== undefined) {
      updates.push(`stock = $${paramIndex++}`)
      values.push(Number(stock))
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`)
      values.push(image_url ? String(image_url).trim() : null)
    }

    if (!updates.length) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 })
    }

    values.push(id)
    const sql = `UPDATE products SET ${updates.join(", ")} WHERE id = $${paramIndex++} 
                 RETURNING id, name, description, category, price, image_url, stock, created_at`

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

    // Delete product from database
    await query("DELETE FROM products WHERE id = $1", [id])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] admin delete product error:", err)
    return NextResponse.json({ error: "Could not delete product." }, { status: 500 })
  }
}
