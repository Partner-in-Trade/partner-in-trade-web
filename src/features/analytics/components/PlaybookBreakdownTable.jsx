import React from 'react';
import { useSelector } from 'react-redux';
import { selectAnalytics, selectAnalyticsLoading } from '@/app/store';

export function PlaybookBreakdownTable() {
  const analytics = useSelector(selectAnalytics);
  const loading = useSelector(selectAnalyticsLoading);
  const rows = analytics?.strategyBreakdown || [];
  const currency = analytics?.currency || 'USD';

  return (
    <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-pit-border">
        <h3 className="text-sm font-semibold text-white">Playbook Strategy Breakdown</h3>
        <p className="text-xs text-slate-400">Backend-calculated closed-trade performance grouped by strategy</p>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-pit-bg text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3 px-4">Setup Strategy</th>
            <th className="py-3 px-4 text-right">Closed Trades</th>
            <th className="py-3 px-4 text-right">Win Rate</th>
            <th className="py-3 px-4 text-right">Avg R-Mult</th>
            <th className="py-3 px-4 text-right">Net P&amp;L ({currency})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pit-border">
          {rows.map((row) => (
            <tr key={row.strategy} className="hover:bg-slate-800/30">
              <td className="py-3 px-4 font-semibold text-white">{row.strategy}</td>
              <td className="py-3 px-4 text-right font-mono">{row.closedTradesCount}</td>
              <td className="py-3 px-4 text-right font-mono text-indigo-400">{row.winRate}%</td>
              <td className="py-3 px-4 text-right font-mono">{row.avgRMultiple}R</td>
              <td className={`py-3 px-4 text-right font-mono font-bold ${row.netPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'}`}>
                {row.netPnl >= 0 ? '+' : ''}{row.netPnl.toFixed(2)}
              </td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={5} className="py-6 px-4 text-center text-sm text-slate-400">No closed trades to analyze yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
