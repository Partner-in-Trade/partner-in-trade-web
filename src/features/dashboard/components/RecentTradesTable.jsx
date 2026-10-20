import React from 'react';
import { OutcomeBadge } from '@/components/ui/OutcomeBadge';

export function RecentTradesTable({ trades, onSelectTrade }) {
  const recent = trades.slice(0, 6);
  return (
    <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-pit-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Recent Executions</h3>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-pit-bg text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3 px-4">Date</th><th className="py-3 px-4">Symbol</th><th className="py-3 px-4">Side</th>
            <th className="py-3 px-4">Setup</th><th className="py-3 px-4 text-right">R-Mult</th><th className="py-3 px-4 text-right">Net P&L</th><th className="py-3 px-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pit-border">
          {recent.map((t) => (
            <tr key={t.id} onClick={() => onSelectTrade(t)} className="hover:bg-slate-800/40 cursor-pointer transition">
              <td className="py-3 px-4 font-mono text-xs text-slate-300">{t.date}</td>
              <td className="py-3 px-4 font-bold text-white">{t.symbol}</td>
              <td className="py-3 px-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${t.direction === 'LONG' ? 'bg-emerald-500/10 text-pit-profit' : 'bg-rose-500/10 text-pit-loss'}`}>{t.direction}</span></td>
              <td className="py-3 px-4 text-slate-300 text-xs">{t.setup}</td>
              <td className="py-3 px-4 text-right font-mono text-xs text-slate-300">{t.rMultiple}R</td>
              <td className={`py-3 px-4 text-right font-mono font-semibold ${t.netPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'}`}>{t.netPnl >= 0 ? '+' : ''}${t.netPnl.toFixed(2)}</td>
              <td className="py-3 px-4 text-center"><OutcomeBadge outcome={t.outcome} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}