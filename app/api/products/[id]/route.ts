import { type NextRequest, NextResponse } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { getProductById } from "@/lib/queries"

export const runtime = "nodejs"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }
  try {
    const { id } = await params
    const product = await getProductById(id)
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 })
    return NextResponse.json({ product })
  } catch (err) {
    console.error("[v0] product detail error:", err)
    return NextResponse.json({ error: "Could not load product." }, { status: 500 })
  }
}
