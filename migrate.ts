import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Add it to .env.local before running migrate.ts.');
    process.exit(1);
  }
  const sql = neon(url);

  console.log('[migrate] Creating rate_submissions table if missing...');
  await sql`
    CREATE TABLE IF NOT EXISTS rate_submissions (
      id SERIAL PRIMARY KEY,
      share_id VARCHAR(50) UNIQUE NOT NULL,
      skill VARCHAR(50) NOT NULL,
      region VARCHAR(50) NOT NULL,
      experience VARCHAR(20) NOT NULL,
      rate DECIMAL(10, 2) NOT NULL,
      verdict VARCHAR(50) NOT NULL,
      difference_pct DECIMAL(7, 2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log('[migrate] Adding is_underpriced column if missing...');
  await sql`
    ALTER TABLE rate_submissions
    ADD COLUMN IF NOT EXISTS is_underpriced BOOLEAN NOT NULL DEFAULT FALSE
  `;

  console.log('[migrate] Adding source column if missing...');
  await sql`
    ALTER TABLE rate_submissions
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'user'
  `;

  console.log('[migrate] Backfilling is_underpriced from verdict for legacy rows...');
  await sql`
    UPDATE rate_submissions
    SET is_underpriced = (verdict IN ('underpriced', 'severely_underpriced'))
    WHERE is_underpriced IS DISTINCT FROM (verdict IN ('underpriced', 'severely_underpriced'))
  `;

  console.log('[migrate] Ensuring helper indexes exist...');
  await sql`CREATE INDEX IF NOT EXISTS idx_rate_submissions_created_at ON rate_submissions (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rate_submissions_skill ON rate_submissions (skill)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rate_submissions_region ON rate_submissions (region)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rate_submissions_source ON rate_submissions (source)`;

  const countQ = await sql`SELECT COUNT(*)::int AS c FROM rate_submissions`;
  console.log(`[migrate] Done. Current row count: ${countQ[0].c}`);
}

main().catch((err) => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});
