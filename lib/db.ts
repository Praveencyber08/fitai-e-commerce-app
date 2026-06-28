import { Pool, type ClientBase } from "pg"
import { DsqlSigner } from "@aws-sdk/dsql-signer"
import { attachDatabasePool } from "@vercel/functions"

const globalForPool = globalThis as unknown as { __fitaiPool?: Pool }

function createPool(): Pool {
  const pghost = process.env.PGHOST
  const region = process.env.DSQL_REGION || process.env.AWS_REGION || "us-east-1"
  const accessKeyId = process.env.DSQL_ACCESS_KEY_ID
  const secretAccessKey = process.env.DSQL_SECRET_ACCESS_KEY

  // Use DSQL credentials to create auth token
  const signer = new DsqlSigner({
    credentials: {
      accessKeyId: accessKeyId || "",
      secretAccessKey: secretAccessKey || "",
    },
    region: region,
    hostname: pghost,
    expiresIn: 900,
  })

  const pool = new Pool({
    host: pghost,
    user: process.env.PGUSER || "admin",
    database: process.env.PGDATABASE || "postgres",
    password: async () => signer.getDbConnectAdminAuthToken(),
    port: 5432,
    ssl: true,
    max: 20,
  })
  attachDatabasePool(pool)
  return pool
}

function getPool(): Pool {
  if (!globalForPool.__fitaiPool) {
    globalForPool.__fitaiPool = createPool()
  }
  return globalForPool.__fitaiPool
}

/** True when the Aurora DSQL connection env vars are present. */
export function isDbConfigured(): boolean {
  return Boolean(
    process.env.PGHOST &&
      process.env.DSQL_ACCESS_KEY_ID &&
      process.env.DSQL_SECRET_ACCESS_KEY
  )
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
