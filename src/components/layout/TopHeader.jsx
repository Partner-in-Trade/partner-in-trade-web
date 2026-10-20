import React from 'react';
import { useTrades } from '@/app/providers/TradeContext';

export function TopHeader({ activeTab }) {
  const { metrics } = useTrades();

  const titles = {
    dashboard: 'Performance Overview',
    calendar: 'Monthly P&L Calendar',
    tradelog: 'Manual Trade Execution Log',
    analytics: 'Playbooks, Edge & Mistake Analytics',
  };

  return (
    <header className="h-16 bg-pit-card/80 backdrop-blur border-b border-pit-border px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-white">{titles[activeTab]}</h1>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Net P&L:</span>
          <span
            className={`font-mono font-bold ${
              metrics.totalNetPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'
            }`}
          >
            {metrics.totalNetPnl >= 0 ? '+' : ''}${metrics.totalNetPnl.toLocaleString()}
          </span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Win Rate:</span>
          <span className="font-mono font-semibold text-indigo-400">{metrics.winRate}%</span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Profit Factor:</span>
          <span className="font-mono font-semibold text-slate-200">
            {metrics.profitFactor}
          </span>
        </div>
      </div>
    </header>
  );
}