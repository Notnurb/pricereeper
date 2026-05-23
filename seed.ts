import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
import {
  getBenchmark,
  evaluateRate,
  Skill,
  Region,
  Experience
} from './src/lib/benchmarks';

interface SeedRow {
  skill: Skill;
  region: Region;
  experience: Experience;
  rate: number;
  minutesAgo: number;
}

const ROWS: SeedRow[] = [
  { skill: 'Web Dev', region: 'US', experience: '3-5yrs', rate: 85, minutesAgo: 12 },
  { skill: 'Web Dev', region: 'US', experience: '6+yrs', rate: 160, minutesAgo: 28 },
  { skill: 'Web Dev', region: 'EU', experience: '0-2yrs', rate: 28, minutesAgo: 45 },
  { skill: 'Web Dev', region: 'EU', experience: '3-5yrs', rate: 78, minutesAgo: 90 },
  { skill: 'Web Dev', region: 'LatAm', experience: '3-5yrs', rate: 40, minutesAgo: 120 },
  { skill: 'Web Dev', region: 'Asia', experience: '0-2yrs', rate: 12, minutesAgo: 180 },
  { skill: 'Web Dev', region: 'Remote-anywhere', experience: '6+yrs', rate: 145, minutesAgo: 240 },

  { skill: 'Design', region: 'US', experience: '3-5yrs', rate: 75, minutesAgo: 8 },
  { skill: 'Design', region: 'UK', experience: '6+yrs', rate: 130, minutesAgo: 65 },
  { skill: 'Design', region: 'EU', experience: '0-2yrs', rate: 25, minutesAgo: 95 },
  { skill: 'Design', region: 'LatAm', experience: '6+yrs', rate: 95, minutesAgo: 150 },
  { skill: 'Design', region: 'Remote-anywhere', experience: '3-5yrs', rate: 55, minutesAgo: 210 },

  { skill: 'Writing', region: 'US', experience: '0-2yrs', rate: 18, minutesAgo: 22 },
  { skill: 'Writing', region: 'US', experience: '3-5yrs', rate: 55, minutesAgo: 50 },
  { skill: 'Writing', region: 'UK', experience: '6+yrs', rate: 110, minutesAgo: 105 },
  { skill: 'Writing', region: 'Asia', experience: '3-5yrs', rate: 22, minutesAgo: 160 },
  { skill: 'Writing', region: 'Remote-anywhere', experience: '0-2yrs', rate: 15, minutesAgo: 220 },

  { skill: 'Marketing', region: 'US', experience: '6+yrs', rate: 175, minutesAgo: 18 },
  { skill: 'Marketing', region: 'EU', experience: '3-5yrs', rate: 60, minutesAgo: 75 },
  { skill: 'Marketing', region: 'UK', experience: '0-2yrs', rate: 32, minutesAgo: 135 },
  { skill: 'Marketing', region: 'LatAm', experience: '3-5yrs', rate: 50, minutesAgo: 195 },

  { skill: 'Video', region: 'US', experience: '0-2yrs', rate: 22, minutesAgo: 38 },
  { skill: 'Video', region: 'EU', experience: '3-5yrs', rate: 65, minutesAgo: 85 },
  { skill: 'Video', region: 'Asia', experience: '6+yrs', rate: 60, minutesAgo: 145 },
  { skill: 'Video', region: 'Remote-anywhere', experience: '6+yrs', rate: 120, minutesAgo: 200 },

  { skill: 'Consulting', region: 'US', experience: '3-5yrs', rate: 140, minutesAgo: 10 },
  { skill: 'Consulting', region: 'US', experience: '6+yrs', rate: 280, minutesAgo: 55 },
  { skill: 'Consulting', region: 'UK', experience: '3-5yrs', rate: 110, minutesAgo: 115 },
  { skill: 'Consulting', region: 'EU', experience: '6+yrs', rate: 210, minutesAgo: 175 },
  { skill: 'Consulting', region: 'Remote-anywhere', experience: '3-5yrs', rate: 95, minutesAgo: 250 }
];

function shareIdFor(i: number): string {
  // Stable, obviously-seed share IDs so they're easy to identify/delete.
  return `seed-${i.toString().padStart(3, '0')}`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Add it to .env.local before running seed.ts.');
    process.exit(1);
  }
  const sql = neon(url);

  // Verify schema has the new columns; abort with a clear error if not.
  try {
    await sql`SELECT is_underpriced, source FROM rate_submissions LIMIT 1`;
  } catch {
    console.error('[seed] Schema is missing is_underpriced/source columns. Run migrate.ts first.');
    process.exit(1);
  }

  console.log(`[seed] Inserting ${ROWS.length} rows tagged source='seed'...`);
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < ROWS.length; i++) {
    const r = ROWS[i];
    const bench = getBenchmark(r.skill, r.region, r.experience);
    const evalRes = evaluateRate(r.rate, bench);
    const isUnder = r.rate < bench.median;
    const createdAt = new Date(Date.now() - r.minutesAgo * 60 * 1000).toISOString();
    const shareId = shareIdFor(i + 1);

    const result = await sql`
      INSERT INTO rate_submissions
        (share_id, skill, region, experience, rate, verdict, difference_pct, is_underpriced, source, created_at)
      VALUES
        (${shareId}, ${r.skill}, ${r.region}, ${r.experience}, ${r.rate},
         ${evalRes.verdict}, ${evalRes.differencePct}, ${isUnder}, 'seed', ${createdAt})
      ON CONFLICT (share_id) DO NOTHING
      RETURNING id
    `;
    if (result.length > 0) {
      inserted += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(`[seed] Done. Inserted: ${inserted}, skipped (already present): ${skipped}.`);
  console.log("[seed] To remove later:  DELETE FROM rate_submissions WHERE source = 'seed';");
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
