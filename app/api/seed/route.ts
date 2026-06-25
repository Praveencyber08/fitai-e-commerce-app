import { NextResponse } from "next/server"
import { query, isDbConfigured } from "@/lib/db"
import { PRODUCTS } from "@/lib/data/products"
import { hashPassword } from "@/lib/auth"
import { randomUUID } from "crypto"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Idempotent seed: loads the product catalog and a default admin account.
 * Safe to call multiple times (uses ON CONFLICT DO UPDATE).
 */
export async function POST() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured. Connect Aurora DSQL first." }, { status: 503 })
  }

  try {
    for (const p of PRODUCTS) {
      await query(
        `INSERT INTO products
          (id, name, brand, description, category, sub_category, price, mrp, discount_percent,
           rating, rating_count, image, images, sizes, colors, tags, stock, in_stock, is_trending, is_new)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, brand = EXCLUDED.brand, description = EXCLUDED.description,
           category = EXCLUDED.category, sub_category = EXCLUDED.sub_category, price = EXCLUDED.price,
           mrp = EXCLUDED.mrp, discount_percent = EXCLUDED.discount_percent, rating = EXCLUDED.rating,
           rating_count = EXCLUDED.rating_count, image = EXCLUDED.image, images = EXCLUDED.images,
           sizes = EXCLUDED.sizes, colors = EXCLUDED.colors, tags = EXCLUDED.tags, stock = EXCLUDED.stock,
           in_stock = EXCLUDED.in_stock, is_trending = EXCLUDED.is_trending, is_new = EXCLUDED.is_new`,
        [
          p.id,
          p.name,
          p.brand,
          p.description,
          p.category,
          p.subCategory,
          p.price,
          p.mrp,
          p.discountPercent,
          p.rating,
          p.ratingCount,
          p.image,
          p.images.join(","),
          p.sizes.join(","),
          p.colors.join(","),
          p.tags.join(","),
          p.stock,
          p.inStock,
          p.isTrending ?? false,
          p.isNew ?? false,
        ],
      )
    }

    // Default admin account (idempotent).
    const adminEmail = "admin@fitai.com"
    const existing = await query("SELECT id FROM users WHERE email = $1", [adminEmail])
    if (existing.rows.length === 0) {
      await query(
        "INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5)",
        [randomUUID(), "FitAI Admin", adminEmail, hashPassword("admin123"), "admin"],
      )
    }

    return NextResponse.json({ ok: true, products: PRODUCTS.length })
  } catch (err) {
    console.error("[v0] seed error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
