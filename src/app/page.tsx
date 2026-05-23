'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Share2,
  RotateCcw,
  Activity,
  Users,
  BarChart3,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  SKILLS,
  REGIONS,
  Skill,
  Region,
  Experience
} from '@/lib/benchmarks';
import { submitRateAction, getStatsAction } from '@/lib/actions';

type Verdict = 'severely_underpriced' | 'underpriced' | 'on_market' | 'premium';

type BreakdownRow = { key: string; averageRate: number; count: number };

interface ResultState {
  submission: {
    share_id: string;
    skill: Skill;
    region: Region;
    experience: Experience;
    rate: number;
    verdict: Verdict;
    difference_pct: number;
    created_at: string;
  };
  benchmark: { low: number; median: number; high: number };
}

interface StatsState {
  totalCount: number;
  underpricedPct: number | null;
  averageRate: number | null;
  hasEnoughData: boolean;
  minRowsForRatios: number;
  perSkill: BreakdownRow[];
  perRegion: BreakdownRow[];
  recent: Array<{
    skill: string;
    region: string;
    experience: string;
    rate: number;
    verdict: string;
    created_at: string;
  }>;
}

const INITIAL_STATS: StatsState = {
  totalCount: 0,
  underpricedPct: null,
  averageRate: null,
  hasEnoughData: false,
  minRowsForRatios: 15,
  perSkill: [],
  perRegion: [],
  recent: []
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.floor(diffMs / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Home() {
  // Form state
  const [skill, setSkill] = useState<Skill>('Web Dev');
  const [region, setRegion] = useState<Region>('US');
  const [experience, setExperience] = useState<Experience>('3-5yrs');
  const [rateInput, setRateInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Result state
  const [result, setResult] = useState<ResultState | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Live stats (polled every 20s)
  const [stats, setStats] = useState<StatsState>(INITIAL_STATS);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const data = (await getStatsAction()) as StatsState;
        if (!cancelled) setStats(data);
      } catch (err) {
        // network/db hiccup — keep previous stats
        console.error('Failed to refresh stats:', err);
      }
    }
    loadStats();
    const id = setInterval(loadStats, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const refreshStats = async () => {
    try {
      const data = (await getStatsAction()) as StatsState;
      setStats(data);
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const parsedRate = parseFloat(rateInput);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      setSubmitError('Please enter a valid hourly rate.');
      return;
    }

    setIsSubmitting(true);

    const res = await submitRateAction({
      skill,
      region,
      experience,
      rate: parsedRate
    });

    setIsSubmitting(false);

    if (!res.success) {
      setSubmitError(res.error || 'Could not save submission. Please try again.');
      return;
    }

    setResult({
      submission: res.submission as ResultState['submission'],
      benchmark: res.benchmark
    });
    setCopied(false);
    setShareUrl('');

    const verdict = res.submission.verdict;
    if (verdict === 'premium' || verdict === 'on_market') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#a3e635', '#22c55e', '#ffffff']
      });
    }

    refreshStats();
  };

  const handleShare = async () => {
    if (!result) return;
    const shareId = result.submission.share_id;
    const url = `${window.location.origin}/report/${shareId}`;
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleReset = () => {
    setResult(null);
    setRateInput('');
    setShareUrl('');
    setCopied(false);
    setSubmitError('');
  };

  const getVerdictDetails = (verdict: string) => {
    switch (verdict) {
      case 'premium':
        return {
          bg: 'bg-lime-500/10 border-lime-500/30 text-lime-400',
          badge: 'bg-lime-500/20 text-lime-300 border-lime-400/20',
          textGlow: 'text-glow-green',
          icon: <Sparkles className="h-8 w-8 text-lime-400" />,
          title: 'Premium Rate!',
          desc: 'You are pricing above the high end of our benchmark estimate for this skill, region, and experience tier. Common reasons: specialized niche, retained-client work, or strong portfolio leverage.'
        };
      case 'on_market':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/20',
          textGlow: 'text-glow-green',
          icon: <CheckCircle className="h-8 w-8 text-emerald-400" />,
          title: 'On-Market Average',
          desc: 'Your rate is inside the typical range of our benchmark estimate for this skill, region, and experience tier.'
        };
      case 'underpriced':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-400/20',
          textGlow: '',
          icon: <TrendingDown className="h-8 w-8 text-amber-400" />,
          title: 'Underpriced',
          desc: 'Your rate is below the median of our benchmark estimate for this combination. Consider raising your next quote by 15–20% and see if the market still says yes.'
        };
      case 'severely_underpriced':
      default:
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          badge: 'bg-red-500/20 text-red-300 border-red-400/20',
          textGlow: 'text-glow-red',
          icon: <AlertTriangle className="h-8 w-8 text-red-400" />,
          title: 'Severely Underpriced',
          desc: 'Your rate is below the low end of our benchmark estimate for this combination. Worth re-pricing before your next proposal.'
        };
    }
  };

  const getMarkerPosition = () => {
    if (!result) return 0;
    const rate = result.submission.rate;
    const { low, high } = result.benchmark;
    const minVal = Math.min(low * 0.6, rate);
    const maxVal = Math.max(high * 1.4, rate);
    const range = maxVal - minVal;
    return Math.max(2, Math.min(98, ((rate - minVal) / range) * 100));
  };

  const getLowPosition = () => {
    if (!result) return 0;
    const rate = result.submission.rate;
    const { low, high } = result.benchmark;
    const minVal = Math.min(low * 0.6, rate);
    const maxVal = Math.max(high * 1.4, rate);
    return Math.max(0, Math.min(100, ((low - minVal) / (maxVal - minVal)) * 100));
  };

  const getMedianPosition = () => {
    if (!result) return 0;
    const rate = result.submission.rate;
    const { low, median, high } = result.benchmark;
    const minVal = Math.min(low * 0.6, rate);
    const maxVal = Math.max(high * 1.4, rate);
    return Math.max(0, Math.min(100, ((median - minVal) / (maxVal - minVal)) * 100));
  };

  const getHighPosition = () => {
    if (!result) return 0;
    const rate = result.submission.rate;
    const { low, high } = result.benchmark;
    const minVal = Math.min(low * 0.6, rate);
    const maxVal = Math.max(high * 1.4, rate);
    return Math.max(0, Math.min(100, ((high - minVal) / (maxVal - minVal)) * 100));
  };

  const getVerdictLabel = (verdict: string) => {
    if (verdict === 'premium') return 'Premium';
    if (verdict === 'on_market') return 'On Market';
    if (verdict === 'underpriced') return 'Underpriced';
    return 'Severely Under';
  };

  const getVerdictBadgeColor = (verdict: string) => {
    if (verdict === 'premium') return 'text-lime-400 bg-lime-500/10 border-lime-500/20';
    if (verdict === 'on_market') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (verdict === 'underpriced') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  // Cap the bar-list bar width by the largest avg in the breakdown.
  const maxSkillAvg = stats.perSkill.reduce((m, r) => Math.max(m, r.averageRate), 0) || 1;
  const maxRegionAvg = stats.perRegion.reduce((m, r) => Math.max(m, r.averageRate), 0) || 1;

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      <div className="bg-mesh" />

      {/* HEADER */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-400/20">
              <ShieldCheck className="h-6 w-6 text-black" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Price<span className="text-lime-400">Reeper</span>
              </span>
              <span className="block text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
                Anonymous Rate Check
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-xs text-zinc-400 font-mono bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
            {stats.totalCount > 0
              ? `${stats.totalCount} SUBMISSIONS`
              : 'AWAITING SUBMISSIONS'}
          </div>
        </div>
      </header>

      {/* RECENT SUBMISSIONS TICKER — hidden when empty */}
      {stats.recent.length > 0 && (
        <div className="relative z-10 border-b border-white/5 bg-zinc-950/40 backdrop-blur-sm py-2.5 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 overflow-hidden">
            <div className="w-full relative flex items-center">
              <span className="text-[11px] font-mono font-bold tracking-wider text-lime-400 mr-4 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded shadow z-10 shrink-0">
                LIVE CHECKS:
              </span>
              <div className="overflow-hidden w-full relative">
                <div className="animate-ticker flex space-x-8 items-center">
                  {/* Double the array to make seamless scrolling */}
                  {[...stats.recent, ...stats.recent].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-xs text-zinc-300 font-medium whitespace-nowrap bg-zinc-900/60 px-3 py-1 rounded-full border border-zinc-800/40"
                    >
                      <span className="text-zinc-500 font-semibold">{item.skill}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{item.region}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-white">${item.rate}/hr</span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full border ${getVerdictBadgeColor(
                          item.verdict
                        )}`}
                      >
                        {getVerdictLabel(item.verdict)}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-8">

          {/* INTRO */}
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-lime-400/10 border border-lime-400/20 text-lime-400 px-3 py-1 rounded-full text-xs font-semibold">
              <Activity className="h-3.5 w-3.5" />
              <span>Compare Your Rate to a Benchmark Estimate</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Stop Guessing. <br />
              <span className="bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent">
                Reap Your Worth.
              </span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto lg:mx-0">
              Enter your current hourly rate. We compare it against a starting benchmark estimate for your skill, region, and experience level, then show how it lines up with rates other PriceReeper users have submitted.
            </p>
          </div>

          {!result ? (
            /* CALCULATOR FORM */
            <form
              onSubmit={handleSubmit}
              className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="skill" className="block text-xs font-mono tracking-wider text-zinc-400 uppercase">
                    Skill Field
                  </label>
                  <select
                    id="skill"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value as Skill)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition text-sm cursor-pointer"
                  >
                    {SKILLS.map((sk) => (
                      <option key={sk} value={sk}>{sk}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="experience" className="block text-xs font-mono tracking-wider text-zinc-400 uppercase">
                    Years of Experience
                  </label>
                  <select
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as Experience)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition text-sm cursor-pointer"
                  >
                    {EXPERIENCE_LABELS.map((opt) => (
                      <option key={opt.val} value={opt.val}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="region" className="block text-xs font-mono tracking-wider text-zinc-400 uppercase">
                    Region / Marketplace
                  </label>
                  <select
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value as Region)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition text-sm cursor-pointer"
                  >
                    {REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg === 'Remote-anywhere' ? 'Global Remote' : reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="rate" className="block text-xs font-mono tracking-wider text-zinc-400 uppercase">
                    Your Hourly Rate (USD)
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-zinc-500" />
                    </div>
                    <input
                      id="rate"
                      type="number"
                      required
                      min="1"
                      max="10000"
                      value={rateInput}
                      onChange={(e) => setRateInput(e.target.value)}
                      placeholder="e.g. 85"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-zinc-500 text-xs font-mono">/hr</span>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-black font-extrabold rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-lime-400/10 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Reeping rates...</span>
                  </span>
                ) : (
                  <>
                    <span>Check My Rate</span>
                    <ArrowRight className="h-4 w-4 text-black stroke-[3px]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* RESULTS SCREEN */
            <div className="glass-panel-glow rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Analysis Result</span>
                  <h2 className="text-2xl font-black text-white mt-1">Rate Check Report</h2>
                </div>
                <div
                  className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase font-mono ${
                    getVerdictDetails(result.submission.verdict).badge
                  }`}
                >
                  {result.submission.verdict.replace('_', ' ')}
                </div>
              </div>

              <div
                className={`p-5 rounded-2xl border flex items-center space-x-4 ${
                  getVerdictDetails(result.submission.verdict).bg
                }`}
              >
                <div className="shrink-0 bg-black/30 p-3 rounded-xl">
                  {getVerdictDetails(result.submission.verdict).icon}
                </div>
                <div>
                  <h3
                    className={`text-xl font-extrabold ${
                      getVerdictDetails(result.submission.verdict).textGlow
                    }`}
                  >
                    {getVerdictDetails(result.submission.verdict).title}
                  </h3>
                  <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                    {getVerdictDetails(result.submission.verdict).desc}
                  </p>
                </div>
              </div>

              <div className="space-y-3 py-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Below Range</span>
                  <span className="text-white font-bold">Benchmark Estimate Spectrum</span>
                  <span>Premium Tier</span>
                </div>

                <div className="relative h-5 bg-zinc-900 rounded-full border border-zinc-800/80 overflow-visible mt-2">
                  <div
                    className="absolute top-0 bottom-0 left-0 rate-spectrum-under opacity-45 rounded-l-full"
                    style={{ width: `${getLowPosition()}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 rate-spectrum-market opacity-20"
                    style={{
                      left: `${getLowPosition()}%`,
                      width: `${getHighPosition() - getLowPosition()}%`
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 rate-spectrum-premium opacity-45 rounded-r-full"
                    style={{
                      left: `${getHighPosition()}%`,
                      width: `${100 - getHighPosition()}%`
                    }}
                  />

                  <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-800" style={{ left: `${getLowPosition()}%` }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-400" style={{ left: `${getMedianPosition()}%` }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-800" style={{ left: `${getHighPosition()}%` }} />

                  <div
                    className="absolute -top-3 bottom-0 flex flex-col items-center group transition-all duration-1000 ease-out"
                    style={{ left: `${getMarkerPosition()}%` }}
                  >
                    <div className="h-6 w-6 rounded-full bg-white border-4 border-lime-400 flex items-center justify-center shadow-lg shadow-lime-400/50 scale-110">
                      <span className="h-1 w-1 rounded-full bg-black"></span>
                    </div>
                    <span className="mt-1 bg-zinc-950 border border-lime-400/40 text-[10px] text-lime-400 font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Your Rate: ${result.submission.rate}/hr
                    </span>
                  </div>
                </div>

                <div className="relative h-6 text-[10px] font-mono text-zinc-500 mt-2">
                  <div className="absolute transform -translate-x-1/2" style={{ left: `${getLowPosition()}%` }}>
                    Low: ${result.benchmark.low}
                  </div>
                  <div className="absolute transform -translate-x-1/2 text-zinc-300" style={{ left: `${getMedianPosition()}%` }}>
                    Median: ${result.benchmark.median}
                  </div>
                  <div className="absolute transform -translate-x-1/2" style={{ left: `${getHighPosition()}%` }}>
                    High: ${result.benchmark.high}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Selected Criteria</span>
                  <div className="text-sm font-semibold text-white">
                    {result.submission.skill} •{' '}
                    {result.submission.experience === '0-2yrs'
                      ? 'Junior'
                      : result.submission.experience === '3-5yrs'
                      ? 'Mid-level'
                      : 'Senior (6+yrs)'}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Target Region:{' '}
                    {result.submission.region === 'Remote-anywhere'
                      ? 'Global Remote'
                      : result.submission.region}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Recommendation</span>
                  <div className="text-sm font-semibold text-white">
                    {result.submission.verdict === 'premium' && 'Hold or grow your rate'}
                    {result.submission.verdict === 'on_market' && 'Specialize / niche down to push higher'}
                    {result.submission.verdict === 'underpriced' && 'Test a ~15% rate adjustment'}
                    {result.submission.verdict === 'severely_underpriced' && 'Plan a 30%+ increase on next quote'}
                  </div>
                  <span className="text-xs text-zinc-400 block">
                    Baseline is an internal benchmark estimate — the live index above shows real anonymous submissions.
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 py-3.5 px-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-white text-sm font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-lime-400 stroke-[3px]" />
                      <span className="text-lime-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 text-zinc-400" />
                      <span>Share Rate Report</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="py-3.5 px-6 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-sm font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Test Another Rate</span>
                </button>
              </div>

              {shareUrl && (
                <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-400 break-all select-all text-center">
                  {shareUrl}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL ANALYTICS */}
        <div className="lg:col-span-5 space-y-6">

          {/* GLOBAL INDEX (live) */}
          <div className="glass-panel rounded-3xl p-6 space-y-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="h-5 w-5 text-lime-400" />
                <h2 className="text-base font-extrabold text-white">Live Submission Index</h2>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800/40 p-4 rounded-2xl">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Total Checked</span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {stats.totalCount}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-1">
                  Anonymous submissions
                </span>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/40 p-4 rounded-2xl">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Underpricing Ratio</span>
                {stats.underpricedPct !== null ? (
                  <>
                    <span className="text-2xl font-black text-red-400 mt-1 block">
                      {stats.underpricedPct}%
                    </span>
                    <span className="text-[9px] text-zinc-400 block mt-1">
                      Submitters below their benchmark median
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-base font-bold text-zinc-400 mt-1 block">
                      Not enough data yet
                    </span>
                    <span className="text-[9px] text-zinc-500 block mt-1">
                      Needs ≥ {stats.minRowsForRatios} submissions
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/40 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Average Submitted Rate</span>
                {stats.averageRate !== null ? (
                  <span className="text-2xl font-black text-white mt-1 block">
                    ${stats.averageRate}/hr
                  </span>
                ) : (
                  <span className="text-base font-bold text-zinc-400 mt-1 block">
                    Not enough data yet
                  </span>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Users className="h-5 w-5 text-zinc-400" />
              </div>
            </div>

            {/* PER-SKILL BREAKDOWN */}
            {stats.perSkill.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Average submitted rate by skill
                </h3>
                <div className="space-y-1.5">
                  {stats.perSkill.map((row) => (
                    <div key={row.key} className="flex items-center gap-3 text-xs">
                      <span className="w-24 shrink-0 text-zinc-300 font-medium truncate">{row.key}</span>
                      <div className="flex-1 h-2 bg-zinc-900 border border-zinc-800/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-lime-400 to-emerald-500"
                          style={{ width: `${Math.max(4, (row.averageRate / maxSkillAvg) * 100)}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-white font-mono">${row.averageRate}/hr</span>
                      <span className="w-10 shrink-0 text-right text-zinc-500 font-mono text-[10px]">n={row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PER-REGION BREAKDOWN */}
            {stats.perRegion.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Average submitted rate by region
                </h3>
                <div className="space-y-1.5">
                  {stats.perRegion.map((row) => (
                    <div key={row.key} className="flex items-center gap-3 text-xs">
                      <span className="w-24 shrink-0 text-zinc-300 font-medium truncate">
                        {row.key === 'Remote-anywhere' ? 'Global Remote' : row.key}
                      </span>
                      <div className="flex-1 h-2 bg-zinc-900 border border-zinc-800/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-lime-400"
                          style={{ width: `${Math.max(4, (row.averageRate / maxRegionAvg) * 100)}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-white font-mono">${row.averageRate}/hr</span>
                      <span className="w-10 shrink-0 text-right text-zinc-500 font-mono text-[10px]">n={row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-zinc-500 leading-relaxed text-center font-mono">
              FIGURES UPDATE EVERY 20 SECONDS FROM RATE_SUBMISSIONS.
            </p>
          </div>

          {/* ABOUT — truthful */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-xl border border-white/5 bg-zinc-900/30 text-xs">
            <h3 className="font-extrabold text-white flex items-center space-x-2">
              <Globe className="h-4 w-4 text-zinc-400" />
              <span>About PriceReeper</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              PriceReeper compares your rate against two things:
            </p>
            <ul className="text-zinc-400 leading-relaxed list-disc pl-4 space-y-1.5">
              <li>
                <span className="text-white font-semibold">Baseline:</span> a starting benchmark estimate hard-coded
                per skill / region / experience tier. These are educated guesses, not survey results.
              </li>
              <li>
                <span className="text-white font-semibold">Live index:</span> the real, anonymous rates that PriceReeper
                users have actually submitted, aggregated above and refreshed every 20 seconds.
              </li>
            </ul>
            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/40 flex items-center space-x-2 text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                No accounts. We store only skill, region, experience tier, rate, and verdict — no names, emails, or IPs.
              </span>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 bg-zinc-950 py-8 text-center text-xs text-zinc-600 font-mono">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} PriceReeper. Built for freelancers.</div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-zinc-400 transition">Terms</a>
            <a href="#" className="hover:text-zinc-400 transition">Privacy</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-400 transition"
            >
              Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const EXPERIENCE_LABELS: Array<{ val: Experience; label: string }> = [
  { val: '0-2yrs', label: 'Junior (0-2 YOE)' },
  { val: '3-5yrs', label: 'Mid-Level (3-5 YOE)' },
  { val: '6+yrs', label: 'Senior (6+ YOE)' }
];
