import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.DSQL_ACCESS_KEY_ID,
  password: process.env.DSQL_SECRET_ACCESS_KEY,
  database: 'postgres',
  port: 5432,
  ssl: true,
});

async function runSQL() {
  const schemaFile = path.join(__dirname, '001-setup-schema.sql');
  const sql = fs.readFileSync(schemaFile, 'utf-8');
  
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  console.log(`[v0] Running ${statements.length} statements...`);

  for (const statement of statements) {
    try {
      console.log(`[v0] Executing: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`[v0] ✓ Already exists (skipping)`);
      } else {
        console.error(`[v0] Error:`, err.message);
      }
    }
  }

  console.log('[v0] Schema initialization complete!');
  await pool.end();
}

runSQL().catch(err => {
  console.error('[v0] Fatal error:', err);
  process.exit(1);
});
