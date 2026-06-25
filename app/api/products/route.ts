import { NextResponse } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { getAllProducts } from "@/lib/queries"

export const runtime = "nodejs"

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }
  try {
    const products = await getAllProducts()
    return NextResponse.json({ products })
  } catch (err) {
    console.error("[v0] products list error:", err)
    return NextResponse.json({ error: "Could not load products." }, { status: 500 })
  }
}
