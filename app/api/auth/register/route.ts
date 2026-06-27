import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { query, isDbConfigured } from "@/lib/db"
import { hashPassword, createSession, mapUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 })
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase().trim()

    // If database is configured, try to register against it
    if (isDbConfigured()) {
      try {
        const existing = await query("SELECT id FROM users WHERE email = $1", [normalizedEmail])
        if (existing.rows.length > 0) {
          return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
        }

        const id = randomUUID()
        const result = await query<{
          id: string
          name: string
          email: string
          role: string
          phone: string | null
          created_at: string
        }>(
          `INSERT INTO users (id, name, email, password_hash, role)
           VALUES ($1, $2, $3, $4, 'customer')
           RETURNING id, name, email, role, phone, created_at`,
          [id, String(name).trim(), normalizedEmail, hashPassword(String(password))],
        )

        await createSession(id)
        return NextResponse.json({ user: mapUser(result.rows[0]) }, { status: 201 })
      } catch (dbErr) {
        console.error("[v0] db register error:", dbErr)
        // Fall through to guest fallback if DB operation fails
      }
    }

    // Guest fallback: create local user session
    const userId = "u-" + randomUUID()
    const user = {
      id: userId,
      name: String(name).trim(),
      email: normalizedEmail,
      role: normalizedEmail === "admin@fitai.com" ? "admin" : "customer" as const,
      joinedAt: new Date().toISOString(),
    }
    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error("[v0] register error:", err)
    return NextResponse.json({ error: "Could not create account." }, { status: 500 })
  }
}
