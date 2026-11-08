import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { COMPARE_ROWS } from '@/features/subscription/constants/pricingCopy';

function CellValue({ value }) {
  if (value === 'check') {
    return <Check className="w-4 h-4 text-pit-profit mx-auto" aria-label="Included" />;
  }
  return <span className="text-slate-300 text-sm">{value}</span>;
}

export function ComparePlansSection({ compareRef }) {
  return (
    <section ref={compareRef} className="max-w-5xl mx-auto px-4 py-12" id="compare-plans">
      <h2 className="text-2xl font-bold text-white text-center mb-8">Compare plans</h2>
      <div className="rounded-2xl border border-pit-border bg-pit-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-pit-border text-slate-500 uppercase text-xs tracking-wider">
              <th className="p-4 font-medium">Features</th>
              <th className="p-4 text-center font-medium">Basic ₹299</th>
              <th className="p-4 text-center font-medium">Pro ₹499</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.feature} className="border-b border-pit-border/60 last:border-0">
                <td className="p-4 text-slate-300">{row.feature}</td>
                <td className="p-4 text-center">
                  <CellValue value={row.basic} />
                </td>
                <td className="p-4 text-center">
                  <CellValue value={row.pro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ComparePlansAnchor({ onScroll }) {
  return (
    <div className="flex justify-center py-4">
      <button
        type="button"
        onClick={onScroll}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        Compare plans
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
