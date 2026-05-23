'use client';

import React from 'react';
import { Printer, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ReportActions() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex space-x-3 w-full sm:w-auto justify-end">
      <button
        onClick={handlePrint}
        className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 font-bold rounded-xl text-xs flex items-center space-x-2 transition cursor-pointer print:hidden"
      >
        <Printer className="h-4 w-4" />
        <span>Print PDF</span>
      </button>
      
      <Link
        href="/"
        className="px-5 py-2.5 bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-black font-extrabold rounded-xl text-xs flex items-center space-x-1 transition shadow-lg shadow-lime-400/5 print:hidden"
      >
        <span>Verify My Rate</span>
        <ArrowRight className="h-3.5 w-3.5 text-black stroke-[3px]" />
      </Link>
    </div>
  );
}
