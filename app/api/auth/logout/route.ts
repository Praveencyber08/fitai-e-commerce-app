import { NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST() {
  try {
    await destroySession()
  } catch (err) {
    console.error("[v0] logout error:", err)
  }
  return NextResponse.json({ ok: true })
}
