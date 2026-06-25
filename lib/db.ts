import { Pool, type ClientBase } from "pg"
import { DsqlSigner } from "@aws-sdk/dsql-signer"
import { awsCredentialsProvider } from "@vercel/functions/oidc"
import { attachDatabasePool } from "@vercel/functions"

const globalForPool = globalThis as unknown as { __fitaiPool?: Pool }

function createPool(): Pool {
  const signer = new DsqlSigner({
    credentials: awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN!,
      clientConfig: { region: process.env.AWS_REGION },
    }),
    region: process.env.AWS_REGION,
    hostname: process.env.PGHOST,
    expiresIn: 900,
  })

  const pool = new Pool({
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

function getPool(): Pool {
  if (!globalForPool.__fitaiPool) {
    globalForPool.__fitaiPool = createPool()
  }
  return globalForPool.__fitaiPool
}

/** True when the Aurora DSQL connection env vars are present. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.PGHOST && process.env.AWS_REGION && process.env.AWS_ROLE_ARN)
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
