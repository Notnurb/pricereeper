'use server';

import { sql } from './db';
import {
  getBenchmark,
  evaluateRate,
  Skill,
  Region,
  Experience,
  RateSubmission
} from './benchmarks';

const MIN_ROWS_FOR_RATIOS = 15;

function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'pr-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function submitRateAction(data: {
  skill: Skill;
  region: Region;
  experience: Experience;
  rate: number;
}) {
  const benchmark = getBenchmark(data.skill, data.region, data.experience);
  const evaluation = evaluateRate(data.rate, benchmark);
  const isUnderpriced = data.rate < benchmark.median;
  const shareId = generateShareId();

  try {
    const result = await sql`
      INSERT INTO rate_submissions
        (share_id, skill, region, experience, rate, verdict, difference_pct, is_underpriced, source)
      VALUES
        (${shareId}, ${data.skill}, ${data.region}, ${data.experience}, ${data.rate},
         ${evaluation.verdict}, ${evaluation.differencePct}, ${isUnderpriced}, 'user')
      RETURNING *
    `;

    return {
      success: true as const,
      submission: {
        ...result[0],
        rate: parseFloat(result[0].rate)
      } as RateSubmission,
      benchmark
    };
  } catch (error) {
    console.error('Failed to submit rate to DB:', error);
    return {
      success: false as const,
      error: 'Could not save submission. The database may not be migrated yet.',
      benchmark
    };
  }
}

export async function getRateReportAction(shareId: string) {
  try {
    const result = await sql`
      SELECT * FROM rate_submissions WHERE share_id = ${shareId}
    `;

    if (!result || result.length === 0) {
      return null;
    }

    const sub = result[0];
    const benchmark = getBenchmark(
      sub.skill as Skill,
      sub.region as Region,
      sub.experience as Experience
    );

    return {
      submission: {
        ...sub,
        rate: parseFloat(sub.rate)
      } as RateSubmission,
      benchmark
    };
  } catch (error) {
    console.error('Failed to retrieve rate report from DB:', error);
    return null;
  }
}

export async function getStatsAction() {
  try {
    const totalQ = await sql`SELECT COUNT(*)::int AS count FROM rate_submissions`;
    const totalCount: number = totalQ[0]?.count ?? 0;

    if (totalCount === 0) {
      return {
        totalCount: 0,
        underpricedPct: null,
        averageRate: null,
        hasEnoughData: false,
        minRowsForRatios: MIN_ROWS_FOR_RATIOS,
        perSkill: [] as Array<{ key: string; averageRate: number; count: number }>,
        perRegion: [] as Array<{ key: string; averageRate: number; count: number }>,
        recent: [] as Array<{
          skill: string;
          region: string;
          experience: string;
          rate: number;
          verdict: string;
          created_at: string;
        }>
      };
    }

    const underQ = await sql`
      SELECT COUNT(*)::int AS count FROM rate_submissions WHERE is_underpriced = TRUE
    `;
    const underCount: number = underQ[0]?.count ?? 0;

    const avgQ = await sql`SELECT AVG(rate) AS avg FROM rate_submissions`;
    const averageRate =
      avgQ[0]?.avg != null ? Math.round(parseFloat(avgQ[0].avg)) : null;

    const recentQ = await sql`
      SELECT skill, region, experience, rate, verdict, created_at
      FROM rate_submissions
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const recent = ((recentQ || []) as Array<Record<string, unknown>>).map((r) => ({
      skill: String(r.skill),
      region: String(r.region),
      experience: String(r.experience),
      rate: typeof r.rate === 'string' ? parseFloat(r.rate) : (r.rate as number),
      verdict: String(r.verdict),
      created_at:
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : String(r.created_at)
    }));

    const skillQ = await sql`
      SELECT skill AS key, AVG(rate) AS avg, COUNT(*)::int AS count
      FROM rate_submissions
      GROUP BY skill
      ORDER BY AVG(rate) DESC
    `;
    const perSkill = (skillQ as Array<Record<string, unknown>>).map((r) => ({
      key: String(r.key),
      averageRate: Math.round(parseFloat(String(r.avg))),
      count: Number(r.count)
    }));

    const regionQ = await sql`
      SELECT region AS key, AVG(rate) AS avg, COUNT(*)::int AS count
      FROM rate_submissions
      GROUP BY region
      ORDER BY AVG(rate) DESC
    `;
    const perRegion = (regionQ as Array<Record<string, unknown>>).map((r) => ({
      key: String(r.key),
      averageRate: Math.round(parseFloat(String(r.avg))),
      count: Number(r.count)
    }));

    const hasEnoughData = totalCount >= MIN_ROWS_FOR_RATIOS;

    return {
      totalCount,
      underpricedPct: hasEnoughData
        ? Math.round((underCount / totalCount) * 100)
        : null,
      averageRate: hasEnoughData ? averageRate : null,
      hasEnoughData,
      minRowsForRatios: MIN_ROWS_FOR_RATIOS,
      perSkill,
      perRegion,
      recent
    };
  } catch (error) {
    console.error('Failed to get stats from DB:', error);
    return {
      totalCount: 0,
      underpricedPct: null,
      averageRate: null,
      hasEnoughData: false,
      minRowsForRatios: MIN_ROWS_FOR_RATIOS,
      perSkill: [] as Array<{ key: string; averageRate: number; count: number }>,
      perRegion: [] as Array<{ key: string; averageRate: number; count: number }>,
      recent: [] as Array<{
        skill: string;
        region: string;
        experience: string;
        rate: number;
        verdict: string;
        created_at: string;
      }>
    };
  }
}
