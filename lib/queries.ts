import "server-only"
import { query } from "@/lib/db"
import { mapProduct, type ProductRow } from "@/lib/mappers"
import type { Product } from "@/lib/types"

const PRODUCT_COLUMNS = `id, name, description, price, category, image_url as image, stock, created_at`

export async function getAllProducts(): Promise<Product[]> {
  const result = await query<ProductRow>(`SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY created_at`)
  return result.rows.map(mapProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  const result = await query<ProductRow>(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1`, [id])
  return result.rows[0] ? mapProduct(result.rows[0]) : null
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",")
  const result = await query<ProductRow>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id IN (${placeholders})`,
    ids,
  )
  return result.rows.map(mapProduct)
}

/** Confirms a product exists (app-layer referential integrity for DSQL). */
export async function productExists(id: string): Promise<boolean> {
  const result = await query("SELECT 1 FROM products WHERE id = $1", [id])
  return result.rows.length > 0
}
