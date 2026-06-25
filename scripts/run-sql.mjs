import { readFileSync } from "node:fs"
import { Pool } from "pg"
import { DsqlSigner } from "@aws-sdk/dsql-signer"

const file = process.argv[2]
if (!file) {
  console.error("Usage: node scripts/run-sql.mjs <path-to-sql>")
  process.exit(1)
}

const signer = new DsqlSigner({
  region: process.env.AWS_REGION,
  hostname: process.env.PGHOST,
  expiresIn: 900,
})

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER || "admin",
  database: process.env.PGDATABASE || "postgres",
  password: () => signer.getDbConnectAdminAuthToken(),
  port: 5432,
  ssl: true,
  max: 5,
})

const sql = readFileSync(file, "utf8")
// Split into statements on COMMIT; run each DDL in its own transaction.
const chunks = sql
  .split(/;\s*COMMIT;?/i)
  .map((c) => c.trim())
  .filter((c) => c && !/^--/.test(c.replace(/\n/g, " ").trim()) === false ? c : c)
  .filter((c) => c.replace(/--.*$/gm, "").trim().length > 0)

console.log(`[v0] Running ${chunks.length} statement group(s) from ${file}`)

const client = await pool.connect()
let ok = 0
for (const chunk of chunks) {
  const stmt = chunk.endsWith(";") ? chunk : chunk + ";"
  try {
    await client.query(stmt)
    ok++
    console.log(`[v0] OK: ${stmt.split("\n")[0].slice(0, 70)}`)
  } catch (err) {
    console.error(`[v0] FAILED: ${stmt.split("\n")[0].slice(0, 70)}`)
    console.error(`[v0]   -> ${err.message}`)
  }
}
client.release()
await pool.end()
console.log(`[v0] Done. ${ok}/${chunks.length} succeeded.`)
process.exit(0)
