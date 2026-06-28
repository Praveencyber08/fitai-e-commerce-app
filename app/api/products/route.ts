import { NextResponse } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { getAllProducts } from "@/lib/queries"
import { PRODUCTS } from "@/lib/data/products"

export const runtime = "nodejs"

export async function GET() {
  const dbConfigured = isDbConfigured()
  
  try {
    if (!dbConfigured) {
      console.log("[v0] Database not configured, using mock data")
      return NextResponse.json({ products: PRODUCTS, dbConfigured: false })
    }
    
    const products = await getAllProducts()
    return NextResponse.json({ products, dbConfigured: true })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error("[v0] products list error:", errorMsg)
    console.error("[v0] Stack:", err instanceof Error ? err.stack : "N/A")
    console.log("[v0] Falling back to mock data, but DB is configured")
    return NextResponse.json({ products: PRODUCTS, dbConfigured: true, error: `DB Error: ${errorMsg}` })
  }
}
