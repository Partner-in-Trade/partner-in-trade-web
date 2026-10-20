import React from 'react';
import { useTrades } from '@/app/providers/TradeContext';
import { PlaybookBreakdownTable } from './components/PlaybookBreakdownTable';

export function AnalyticsView() {
  const { trades } = useTrades();

  return (
    <div className="space-y-6">
      <div className="bg-pit-card border border-pit-border rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-1">Partner in Trade Analytics</h2>
        <p className="text-xs text-slate-400">Analyzing behavioral patterns and statistical expectancy across {trades.length} trades.</p>
      </div>
      <PlaybookBreakdownTable />
    </div>
  );
}