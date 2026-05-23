import { neon } from '@neondatabase/serverless';

export const sql = (() => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('DATABASE_URL is not set. Run migrate.ts and ensure .env.local is loaded before runtime queries.');
    return (() => {
      throw new Error('DATABASE_URL is not configured.');
    }) as never;
  }
  return neon(url);
})();
