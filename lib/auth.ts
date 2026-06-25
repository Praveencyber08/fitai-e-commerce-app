import "server-only"
import { randomBytes, scryptSync, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import type { User } from "@/lib/types"

const SESSION_COOKIE = "fitai_session"
const SESSION_DAYS = 30

/** Hash a password as `salt:hash` using scrypt. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

/** Verify a password against a stored `salt:hash`. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const hashBuf = Buffer.from(hash, "hex")
  const testBuf = scryptSync(password, salt, 64)
  return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf)
}

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  created_at: string
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role === "admin" ? "admin" : "customer",
    joinedAt: typeof row.created_at === "string" ? row.created_at : new Date(row.created_at).toISOString(),
  }
}

/** Create a session row and set the httpOnly cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await query("INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)", [token, userId, expires])
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires,
  })
}

/** Delete the current session and clear the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await query("DELETE FROM sessions WHERE token = $1", [token])
    store.delete(SESSION_COOKIE)
  }
}

/** Resolve the signed-in user from the session cookie, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const result = await query<{ user_id: string; expires_at: string }>(
    "SELECT user_id, expires_at FROM sessions WHERE token = $1",
    [token],
  )
  const session = result.rows[0]
  if (!session) return null
  if (new Date(session.expires_at) < new Date()) {
    await query("DELETE FROM sessions WHERE token = $1", [token])
    return null
  }

  const userResult = await query<UserRow>(
    "SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1",
    [session.user_id],
  )
  const user = userResult.rows[0]
  return user ? mapUser(user) : null
}

export { mapUser }
