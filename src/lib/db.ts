import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export const sql = neon(process.env.DATABASE_URL);

export async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS rate_submissions (
        id SERIAL PRIMARY KEY,
        share_id VARCHAR(50) UNIQUE NOT NULL,
        skill VARCHAR(50) NOT NULL,
        region VARCHAR(50) NOT NULL,
        experience VARCHAR(20) NOT NULL,
        rate DECIMAL(10, 2) NOT NULL,
        verdict VARCHAR(50) NOT NULL,
        difference_pct DECIMAL(5, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Database table "rate_submissions" initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
  }
}
