import { type NextRequest, NextResponse } from "next/server"
import { query, isDbConfigured } from "@/lib/db"
import { verifyPassword, createSession, mapUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const result = await query<{
      id: string
      name: string
      email: string
      role: string
      phone: string | null
      created_at: string
      password_hash: string
    }>("SELECT id, name, email, role, phone, created_at, password_hash FROM users WHERE email = $1", [normalizedEmail])

    const row = result.rows[0]
    if (!row || !verifyPassword(String(password), row.password_hash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }

    await createSession(row.id)
    return NextResponse.json({ user: mapUser(row) })
  } catch (err) {
    console.error("[v0] login error:", err)
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 })
  }
}
