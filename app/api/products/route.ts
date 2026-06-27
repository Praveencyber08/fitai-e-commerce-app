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
    console.error("[v0] products list error:", err instanceof Error ? err.message : err)
    console.log("[v0] Falling back to mock data, but DB is configured")
    return NextResponse.json({ products: PRODUCTS, dbConfigured: true, error: "Connection failed, using mock data" })
  }
}
