import { Pool, type ClientBase } from "pg"
import { DsqlSigner } from "@aws-sdk/dsql-signer"
import { attachDatabasePool } from "@vercel/functions"

// Aurora DSQL connection using static IAM credentials.
// The SDK automatically reads AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from the environment.
const signer = new DsqlSigner({
  region: process.env.AWS_REGION,
  hostname: process.env.PGHOST,
  expiresIn: 900,
})

let pool: Pool | null = null

function getPool(): Pool {
  if (pool) return pool
  pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER || "admin",
    database: process.env.PGDATABASE || "postgres",
    // IAM auth token, regenerated per new connection (valid ~15 min).
    password: () => signer.getDbConnectAdminAuthToken(),
    port: 5432,
    ssl: true,
    max: 20,
  })
  attachDatabasePool(pool)
  return pool
}

// Single-query helper.
export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[],
) {
  return getPool().query<T>(text, params)
}

// Multi-query transaction helper.
export async function withConnection<T>(fn: (client: ClientBase) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    return await fn(client)
  } finally {
    ;(client as { release: () => void }).release()
  }
}
