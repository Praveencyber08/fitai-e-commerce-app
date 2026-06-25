import { NextResponse } from "next/server"
import { isDbConfigured, query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  try {
    const customers = await query<{
      id: string
      name: string
      email: string
      role: string
      created_at: string
      orders: string
      spend: string | null
    }>(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              COUNT(o.id) AS orders, COALESCE(SUM(o.total), 0) AS spend
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.role = 'customer'
       GROUP BY u.id, u.name, u.email, u.role, u.created_at
       ORDER BY u.created_at DESC`,
    )
    return NextResponse.json({
      customers: customers.rows.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        role: c.role,
        joinedAt: typeof c.created_at === "string" ? c.created_at : new Date(c.created_at).toISOString(),
        orders: Number.parseInt(c.orders, 10) || 0,
        spend: Number.parseFloat(c.spend ?? "0") || 0,
      })),
    })
  } catch (err) {
    console.error("[v0] admin customers error:", err)
    return NextResponse.json({ error: "Could not load customers." }, { status: 500 })
  }
}
