import "server-only"
import { isDbConfigured } from "@/lib/db"
import { getAllProducts, getProductById } from "@/lib/queries"
import {
  PRODUCTS,
  getProduct as getMockProduct,
  getRelated as getMockRelated,
} from "@/lib/data/products"
import type { Product } from "@/lib/types"

/**
 * Resolve the full catalog. Prefers Aurora DSQL when configured and seeded,
 * otherwise falls back to bundled mock data so the storefront always renders.
 */
export async function resolveProducts(): Promise<Product[]> {
  if (isDbConfigured()) {
    try {
      const rows = await getAllProducts()
      if (rows.length > 0) return rows
    } catch (err) {
      console.error("[v0] resolveProducts DB error, using mock data:", err)
    }
  }
  return PRODUCTS
}

export async function resolveProduct(id: string): Promise<Product | null> {
  if (isDbConfigured()) {
    try {
      const row = await getProductById(id)
      if (row) return row
    } catch (err) {
      console.error("[v0] resolveProduct DB error, using mock data:", err)
    }
  }
  return getMockProduct(id) ?? null
}

export function relatedFrom(all: Product[], product: Product, limit = 4): Product[] {
  const related = all.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit)
  if (related.length >= limit) return related
  return getMockRelated(product)
}
