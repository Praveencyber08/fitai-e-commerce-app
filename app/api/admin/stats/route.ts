import { NextResponse } from "next/server"
import { isDbConfigured, query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  try {
    const [totals, customers, products, byMonth, byCategory] = await Promise.all([
      query<{ orders: string; revenue: string | null }>(
        "SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status <> 'cancelled'",
      ),
      query<{ count: string }>("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'"),
      query<{ count: string }>("SELECT COUNT(*) AS count FROM products"),
      query<{ month: string; revenue: string | null; orders: string }>(
        `SELECT to_char(date_trunc('month', created_at), 'Mon') AS month,
                COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
         FROM orders WHERE status <> 'cancelled'
         GROUP BY date_trunc('month', created_at)
         ORDER BY date_trunc('month', created_at)`,
      ),
      query<{ category: string; value: string | null }>(
        `SELECT p.category AS category, COALESCE(SUM(oi.price * oi.quantity), 0) AS value
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         GROUP BY p.category
         ORDER BY value DESC`,
      ),
    ])

    return NextResponse.json({
      totalRevenue: Number.parseFloat(totals.rows[0]?.revenue ?? "0") || 0,
      totalOrders: Number.parseInt(totals.rows[0]?.orders ?? "0", 10) || 0,
      totalCustomers: Number.parseInt(customers.rows[0]?.count ?? "0", 10) || 0,
      totalProducts: Number.parseInt(products.rows[0]?.count ?? "0", 10) || 0,
      salesByMonth: byMonth.rows.map((r) => ({
        month: r.month.trim(),
        revenue: Number.parseFloat(r.revenue ?? "0") || 0,
        orders: Number.parseInt(r.orders, 10) || 0,
      })),
      categorySplit: byCategory.rows.map((r) => ({
        category: r.category,
        value: Number.parseFloat(r.value ?? "0") || 0,
      })),
    })
  } catch (err) {
    console.error("[v0] admin stats error:", err)
    return NextResponse.json({ error: "Could not load stats." }, { status: 500 })
  }
}
