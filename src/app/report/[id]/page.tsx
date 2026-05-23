import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  Globe, 
  Award, 
  AlertTriangle,
  Users,
  CheckCircle,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { Metadata } from 'next';
import { getRateReportAction } from '@/lib/actions';
import ReportActions from './ReportActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const reportData = await getRateReportAction(resolvedParams.id);

  if (!reportData) {
    return {
      title: "Rate Report Not Found | PriceReeper",
      description: "The requested rate check report could not be found."
    };
  }

  const { submission } = reportData;
  return {
    title: `Rate Check Report: ${submission.skill} ($${submission.rate}/hr) | PriceReeper`,
    description: `PriceReeper rate check for a $${submission.rate}/hr hourly rate as a ${submission.skill} freelancer in ${submission.region} (${submission.experience} experience), compared to a benchmark estimate.`
  };
}

export default async function ReportPage({ params }: PageProps) {
  const resolvedParams = await params;
  const reportData = await getRateReportAction(resolvedParams.id);

  if (!reportData) {
    return (
      <div className="relative min-h-screen flex flex-col justify-center items-center px-6">
        <div className="bg-mesh" />
        <div className="relative z-10 glass-panel rounded-3xl p-8 max-w-md w-full text-center space-y-6 border-red-500/20">
          <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Report Not Found</h1>
            <p className="text-zinc-400 text-sm">
              The rate report code <code className="text-red-400 font-mono text-xs bg-zinc-950 px-1.5 py-0.5 rounded">{resolvedParams.id}</code> does not exist or has expired.
            </p>
          </div>
          <Link
            href="/"
            className="block w-full py-3.5 bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-black font-extrabold rounded-xl text-center text-sm transition"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const { submission, benchmark } = reportData;
  const formattedDate = new Date(submission.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate coordinates for the spectrum bar
  const getPositionPct = (val: number) => {
    const minVal = Math.min(benchmark.low * 0.6, submission.rate);
    const maxVal = Math.max(benchmark.high * 1.4, submission.rate);
    const range = maxVal - minVal;
    return Math.max(0, Math.min(100, ((val - minVal) / range) * 100));
  };

  const markerPos = getPositionPct(submission.rate);
  const lowPos = getPositionPct(benchmark.low);
  const medianPos = getPositionPct(benchmark.median);
  const highPos = getPositionPct(benchmark.high);

  // Verdict style mapper
  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'premium':
        return {
          colorClass: 'text-lime-400 border-lime-500/30 bg-lime-500/5',
          badgeClass: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
          title: 'PREMIUM RATE',
          description: 'Above the high end of the benchmark estimate for this skill, region, and experience tier.',
          icon: <Sparkles className="h-6 w-6 text-lime-400" />
        };
      case 'on_market':
        return {
          colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          title: 'ON-MARKET',
          description: 'Inside the typical range of the benchmark estimate for this combination.',
          icon: <CheckCircle className="h-6 w-6 text-emerald-400" />
        };
      case 'underpriced':
        return {
          colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          title: 'UNDERPRICED',
          description: 'Below the median of the benchmark estimate for this combination.',
          icon: <TrendingDown className="h-6 w-6 text-amber-400" />
        };
      case 'severely_underpriced':
      default:
        return {
          colorClass: 'text-red-400 border-red-500/30 bg-red-500/5',
          badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
          title: 'SEVERELY UNDERPRICED',
          description: 'Below the low end of the benchmark estimate for this combination.',
          icon: <AlertTriangle className="h-6 w-6 text-red-400" />
        };
    }
  };

  const verdictStyles = getVerdictStyles(submission.verdict);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      <div className="bg-mesh" />

      {/* MINI HEADER */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-xl bg-lime-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Price<span className="text-lime-400">Reeper</span>
            </span>
          </Link>
          <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase border border-zinc-800 bg-zinc-900/60 px-3 py-1 rounded-full">
            RATE CHECK REPORT
          </span>
        </div>
      </header>

      {/* CERTIFICATE BODY */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 py-12 md:py-16 space-y-8">
        
        {/* Certificate Card container */}
        <div className="glass-panel rounded-3xl p-6 md:p-10 shadow-2xl relative border-white/10 print:bg-white print:text-black">
          {/* Subtle watermark / seal icon in background */}
          <div className="absolute top-8 right-8 opacity-[0.02] text-white pointer-events-none hidden md:block">
            <Award className="h-96 w-96" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-zinc-800 text-zinc-300 font-mono text-[10px] px-2.5 py-1 rounded-full border border-zinc-700">
                <Award className="h-3.5 w-3.5 text-lime-400" />
                <span>ANONYMOUS RATE CHECK</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Rate Check Report</h1>
              <p className="text-xs text-zinc-500 font-mono">
                Report ID: <span className="text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded ml-1 select-all">{submission.share_id}</span>
              </p>
            </div>
            
            <div className="text-left md:text-right font-mono text-[11px] text-zinc-500 space-y-1">
              <div className="flex items-center md:justify-end space-x-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Submitted: {formattedDate}</span>
              </div>
              <div className="flex items-center md:justify-end space-x-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>Region: {submission.region === 'Remote-anywhere' ? 'Global Remote' : submission.region}</span>
              </div>
            </div>
          </div>

          {/* MAIN VERIFICATION BLOCK */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-white/5">
            <div className="md:col-span-5 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">Submitted Rate</span>
              <div className="text-5xl font-black text-white flex items-baseline tracking-tight">
                <span>${submission.rate}</span>
                <span className="text-lg font-bold text-zinc-500 ml-1">/ hr</span>
              </div>
              <p className="text-xs text-zinc-400 italic mt-2">
                Hourly rate, USD.
              </p>
            </div>

            {/* Verdict Badge */}
            <div className="md:col-span-7">
              <div className={`p-6 rounded-2xl border ${verdictStyles.colorClass} space-y-2`}>
                <div className="flex items-center space-x-2">
                  {verdictStyles.icon}
                  <span className="font-mono text-xs font-black tracking-wider uppercase">{verdictStyles.title}</span>
                </div>
                <h3 className="text-base font-extrabold text-white">
                  {submission.skill} • {submission.experience === '0-2yrs' ? 'Junior' : submission.experience === '3-5yrs' ? 'Mid-level' : 'Senior (6+ YOE)'}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {verdictStyles.description} The benchmark is an internal starting estimate per skill / region / experience tier — not a survey or external market index.
                </p>
              </div>
            </div>
          </div>

          {/* BENCHMARK MATRIX TABLE */}
          <div className="py-8 space-y-6 border-b border-white/5">
            <h3 className="text-sm font-extrabold text-zinc-300 tracking-wide uppercase font-mono">Benchmark Estimate Range</h3>

            <div className="grid grid-cols-3 gap-4 text-center font-mono">
              <div className="bg-zinc-900/40 border border-zinc-800/40 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-500 uppercase block">Low</span>
                <span className="text-lg font-bold text-white mt-1 block">${benchmark.low}/hr</span>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/60 p-4 rounded-xl ring-1 ring-white/5">
                <span className="text-[10px] text-zinc-400 uppercase block">Median</span>
                <span className="text-xl font-black text-lime-400 mt-1 block">${benchmark.median}/hr</span>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/40 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-500 uppercase block">High</span>
                <span className="text-lg font-bold text-white mt-1 block">${benchmark.high}/hr</span>
              </div>
            </div>

            {/* COMPARATIVE SPECTRUM GAUGE */}
            <div className="space-y-2.5 pt-4">
              <div className="relative h-4 bg-zinc-900 rounded-full border border-zinc-800/60">
                {/* Zones */}
                <div 
                  className="absolute top-0 bottom-0 left-0 rate-spectrum-under opacity-40 rounded-l-full"
                  style={{ width: `${lowPos}%` }}
                />
                <div 
                  className="absolute top-0 bottom-0 rate-spectrum-market opacity-20"
                  style={{ left: `${lowPos}%`, width: `${highPos - lowPos}%` }}
                />
                <div 
                  className="absolute top-0 bottom-0 rate-spectrum-premium opacity-40 rounded-r-full"
                  style={{ left: `${highPos}%`, width: `${100 - highPos}%` }}
                />

                {/* Vertical markers */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-800" style={{ left: `${lowPos}%` }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-400" style={{ left: `${medianPos}%` }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-800" style={{ left: `${highPos}%` }} />

                {/* User indicator */}
                <div 
                  className="absolute -top-3 bottom-0 flex flex-col items-center"
                  style={{ left: `${markerPos}%` }}
                >
                  <div className="h-5 w-5 rounded-full bg-white border-4 border-lime-400 flex items-center justify-center shadow shadow-lime-400/30">
                    <span className="h-1 w-1 rounded-full bg-black"></span>
                  </div>
                  <span className="mt-1 bg-zinc-950 border border-lime-400/30 text-[9px] text-lime-400 font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
                    Report Rate: ${submission.rate}/hr
                  </span>
                </div>
              </div>

              <div className="relative h-4 text-[9px] font-mono text-zinc-500">
                <div className="absolute transform -translate-x-1/2" style={{ left: `${lowPos}%` }}>Low</div>
                <div className="absolute transform -translate-x-1/2 text-zinc-300" style={{ left: `${medianPos}%` }}>Median</div>
                <div className="absolute transform -translate-x-1/2" style={{ left: `${highPos}%` }}>High</div>
              </div>
            </div>
          </div>

          {/* FOOTER BLOCK */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>ANONYMOUS — NO NAME, EMAIL, OR IP STORED</span>
            </div>
            <div className="text-center sm:text-right">
              VERDICT VS. BENCHMARK ESTIMATE:{' '}
              <span className={`font-bold ${verdictStyles.colorClass}`}>{verdictStyles.title}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-950/40 p-6 rounded-2xl border border-white/5 relative z-10">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-sm font-extrabold text-white">How does your pricing benchmark?</h4>
            <p className="text-xs text-zinc-400">Run a free audit on your custom hourly rate and skill combo.</p>
          </div>
          <ReportActions />
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 bg-zinc-950 py-8 text-center text-xs text-zinc-600 font-mono">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div>© {new Date().getFullYear()} PriceReeper. Anonymous rate check.</div>
          <Link href="/" className="hover:text-zinc-400 transition">PriceReeper Home</Link>
        </div>
      </footer>
    </div>
  );
}
