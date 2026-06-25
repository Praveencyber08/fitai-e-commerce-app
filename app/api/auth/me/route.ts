import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, mapUser } from "@/lib/auth"
import { isDbConfigured, query } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ user: null, dbConfigured: false })
  }
  try {
    const user = await getCurrentUser()
    return NextResponse.json({ user, dbConfigured: true })
  } catch (err) {
    console.error("[v0] me error:", err)
    return NextResponse.json({ user: null, dbConfigured: true })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }
  try {
    const current = await getCurrentUser()
    if (!current) return NextResponse.json({ error: "Not signed in." }, { status: 401 })

    const { name } = await req.json()
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 })
    }

    const result = await query<{
      id: string
      name: string
      email: string
      role: string
      phone: string | null
      created_at: string
    }>(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role, phone, created_at",
      [String(name).trim(), current.id],
    )
    return NextResponse.json({ user: mapUser(result.rows[0]) })
  } catch (err) {
    console.error("[v0] profile update error:", err)
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 })
  }
}
