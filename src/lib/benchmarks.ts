export interface RateRange {
  low: number;
  median: number;
  high: number;
}

export type Skill = 'Web Dev' | 'Design' | 'Writing' | 'Marketing' | 'Video' | 'Consulting';
export type Region = 'US' | 'EU' | 'UK' | 'LatAm' | 'Asia' | 'Remote-anywhere';
export type Experience = '0-2yrs' | '3-5yrs' | '6+yrs';

export interface RateSubmission {
  id?: number;
  share_id: string;
  skill: Skill;
  region: Region;
  experience: Experience;
  rate: number;
  verdict: 'severely_underpriced' | 'underpriced' | 'on_market' | 'premium';
  difference_pct: number;
  created_at: string;
}

export const SKILLS: Skill[] = ['Web Dev', 'Design', 'Writing', 'Marketing', 'Video', 'Consulting'];
export const REGIONS: Region[] = ['US', 'EU', 'UK', 'LatAm', 'Asia', 'Remote-anywhere'];
export const EXPERIENCE_TIERS: Experience[] = ['0-2yrs', '3-5yrs', '6+yrs'];

// Sensible ballpark hourly rates in USD
export const BENCHMARKS: Record<Skill, Record<Region, Record<Experience, RateRange>>> = {
  'Web Dev': {
    'US': {
      '0-2yrs': { low: 35, median: 50, high: 75 },
      '3-5yrs': { low: 75, median: 100, high: 140 },
      '6+yrs': { low: 130, median: 175, high: 250 }
    },
    'EU': {
      '0-2yrs': { low: 30, median: 45, high: 65 },
      '3-5yrs': { low: 65, median: 85, high: 120 },
      '6+yrs': { low: 110, median: 145, high: 200 }
    },
    'UK': {
      '0-2yrs': { low: 32, median: 48, high: 70 },
      '3-5yrs': { low: 70, median: 90, high: 130 },
      '6+yrs': { low: 120, median: 155, high: 220 }
    },
    'LatAm': {
      '0-2yrs': { low: 20, median: 30, high: 45 },
      '3-5yrs': { low: 45, median: 65, high: 90 },
      '6+yrs': { low: 80, median: 110, high: 160 }
    },
    'Asia': {
      '0-2yrs': { low: 15, median: 25, high: 35 },
      '3-5yrs': { low: 35, median: 50, high: 75 },
      '6+yrs': { low: 70, median: 95, high: 140 }
    },
    'Remote-anywhere': {
      '0-2yrs': { low: 25, median: 35, high: 55 },
      '3-5yrs': { low: 55, median: 75, high: 110 },
      '6+yrs': { low: 100, median: 135, high: 190 }
    }
  },
  'Design': {
    'US': {
      '0-2yrs': { low: 30, median: 45, high: 65 },
      '3-5yrs': { low: 65, median: 90, high: 125 },
      '6+yrs': { low: 110, median: 150, high: 220 }
    },
    'EU': {
      '0-2yrs': { low: 28, median: 40, high: 58 },
      '3-5yrs': { low: 58, median: 78, high: 110 },
      '6+yrs': { low: 95, median: 130, high: 180 }
    },
    'UK': {
      '0-2yrs': { low: 28, median: 42, high: 60 },
      '3-5yrs': { low: 60, median: 82, high: 115 },
      '6+yrs': { low: 100, median: 135, high: 190 }
    },
    'LatAm': {
      '0-2yrs': { low: 18, median: 28, high: 40 },
      '3-5yrs': { low: 40, median: 58, high: 80 },
      '6+yrs': { low: 75, median: 100, high: 140 }
    },
    'Asia': {
      '0-2yrs': { low: 12, median: 20, high: 32 },
      '3-5yrs': { low: 32, median: 45, high: 65 },
      '6+yrs': { low: 60, median: 85, high: 120 }
    },
    'Remote-anywhere': {
      '0-2yrs': { low: 22, median: 32, high: 48 },
      '3-5yrs': { low: 48, median: 68, high: 95 },
      '6+yrs': { low: 85, median: 115, high: 165 }
    }
  },
  'Writing': {
    'US': {
      '0-2yrs': { low: 25, median: 35, high: 50 },
      '3-5yrs': { low: 50, median: 70, high: 100 },
      '6+yrs': { low: 90, median: 125, high: 180 }
    },
    'EU': {
      '0-2yrs': { low: 22, median: 32, high: 45 },
      '3-5yrs': { low: 45, median: 60, high: 85 },
      '6+yrs': { low: 80, median: 110, high: 150 }
    },
    'UK': {
      '0-2yrs': { low: 24, median: 34, high: 48 },
      '3-5yrs': { low: 48, median: 65, high: 90 },
      '6+yrs': { low: 85, median: 115, high: 160 }
    },
    'LatAm': {
      '0-2yrs': { low: 15, median: 22, high: 32 },
      '3-5yrs': { low: 32, median: 45, high: 65 },
      '6+yrs': { low: 60, median: 80, high: 115 }
    },
    'Asia': {
      '0-2yrs': { low: 10, median: 18, high: 28 },
      '3-5yrs': { low: 28, median: 38, high: 55 },
      '6+yrs': { low: 50, median: 70, high: 100 }
    },
    'Remote-anywhere': {
      '0-2yrs': { low: 18, median: 26, high: 38 },
      '3-5yrs': { low: 38, median: 52, high: 75 },
      '6+yrs': { low: 70, median: 95, high: 135 }
    }
  },
  'Marketing': {
    'US': {
      '0-2yrs': { low: 30, median: 45, high: 65 },
      '3-5yrs': { low: 65, median: 90, high: 130 },
      '6+yrs': { low: 115, median: 160, high: 240 }
    },
    'EU': {
      '0-2yrs': { low: 25, median: 38, high: 55 },
      '3-5yrs': { low: 55, median: 75, high: 110 },
      '6+yrs': { low: 95, median: 130, high: 190 }
    },
    'UK': {
      '0-2yrs': { low: 28, median: 40, high: 58 },
      '3-5yrs': { low: 58, median: 80, high: 115 },
      '6+yrs': { low: 100, median: 140, high: 200 }
    },
    'LatAm': {
      '0-2yrs': { low: 18, median: 28, high: 40 },
      '3-5yrs': { low: 40, median: 58, high: 80 },
      '6+yrs': { low: 75, median: 105, high: 150 }
    },
    'Asia': {
      '0-2yrs': { low: 12, median: 20, high: 32 },
      '3-5yrs': { low: 32, median: 45, high: 65 },
      '6+yrs': { low: 60, median: 85, high: 125 }
    },
    'Remote-anywhere': {
      '0-2yrs': { low: 22, median: 32, high: 48 },
      '3-5yrs': { low: 48, median: 68, high: 95 },
      '6+yrs': { low: 85, median: 120, high: 175 }
    }
  },
  'Video': {
    'US': {
      '0-2yrs': { low: 30, median: 45, high: 65 },
      '3-5yrs': { low: 65, median: 85, high: 120 },
      '6+yrs': { low: 110, median: 145, high: 210 }
    },
    'EU': {
      '0-2yrs': { low: 25, median: 38, high: 55 },
      '3-5yrs': { low: 55, median: 72, high: 100 },
      '6+yrs': { low: 90, median: 120, high: 170 }
    },
    'UK': {
      '0-2yrs': { low: 26, median: 40, high: 58 },
      '3-5yrs': { low: 58, median: 75, high: 105 },
      '6+yrs': { low: 95, median: 130, high: 180 }
    },
    'LatAm': {
      '0-2yrs': { low: 18, median: 25, high: 38 },
      '3-5yrs': { low: 38, median: 52, high: 75 },
      '6+yrs': { low: 70, median: 95, high: 135 }
    },
    'Asia': {
      '0-2yrs': { low: 12, median: 18, high: 28 },
      '3-5yrs': { low: 28, median: 40, high: 58 },
      '6+yrs': { low: 55, median: 75, high: 110 }
    },
    'Remote-anywhere': {
      '0-2yrs': { low: 22, median: 32, high: 48 },
      '3-5yrs': { low: 48, median: 65, high: 90 },
      '6+yrs': { low: 80, median: 110, high: 160 }
    }
  },
  'Consulting': {
    'US': {
      '0-2yrs': { low: 50, median: 75, high: 110 },
      '3-5yrs': { low: 110, median: 150, high: 220 },
      '6+yrs': { low: 200, median: 275, high: 400 }
    },
    'EU': {
      '0-2yrs': { low: 40, median: 60, high: 90 },
      '3-5yrs': { low: 90, median: 125, high: 180 },
      '6+yrs': { low: 160, median: 220, high: 320 }
    },
    'UK': {
      '0-2yrs': { low: 45, median: 65, high: 95 },
      '3-5yrs': { low: 95, median: 135, high: 190 },
      '6+yrs': { low: 175, median: 240, high: 350 }
    },
    'LatAm': {
      '0-2yrs': { low: 30, median: 45, high: 65 },
      '3-5yrs': { low: 65, median: 90, high: 130 },
      '6+yrs': { low: 120, median: 165, high: 240 }
    },
    'Asia': {
      '0-2yrs': { low: 25, median: 38, high: 55 },
      '3-5yrs': { low: 55, median: 75, high: 110 },
      '6+yrs': { low: 100, median: 135, high: 190 }
    },
    'Remote-anywhere': {
      '0-2yrs': { low: 35, median: 55, high: 80 },
      '3-5yrs': { low: 80, median: 110, high: 160 },
      '6+yrs': { low: 150, median: 200, high: 300 }
    }
  }
};

export function getBenchmark(skill: Skill, region: Region, experience: Experience): RateRange {
  return BENCHMARKS[skill]?.[region]?.[experience] || { low: 30, median: 50, high: 80 };
}

export function evaluateRate(rate: number, benchmark: RateRange): {
  verdict: 'severely_underpriced' | 'underpriced' | 'on_market' | 'premium';
  differencePct: number;
  labelText: string;
} {
  const diffPct = ((rate - benchmark.median) / benchmark.median) * 100;

  if (rate < benchmark.low) {
    return {
      verdict: 'severely_underpriced',
      differencePct: diffPct,
      labelText: `Severely Underpriced (~${Math.abs(Math.round(diffPct))}% below median)`
    };
  } else if (rate < benchmark.median * 0.95) {
    return {
      verdict: 'underpriced',
      differencePct: diffPct,
      labelText: `Underpriced (~${Math.abs(Math.round(diffPct))}% below median)`
    };
  } else if (rate <= benchmark.high * 1.1) {
    return {
      verdict: 'on_market',
      differencePct: diffPct,
      labelText: `On Market (within normal range)`
    };
  } else {
    return {
      verdict: 'premium',
      differencePct: diffPct,
      labelText: `Premium Rate (~${Math.round(diffPct)}% above median)`
    };
  }
}
