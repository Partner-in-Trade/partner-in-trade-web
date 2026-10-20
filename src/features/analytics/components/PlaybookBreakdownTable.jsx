import React, { useMemo } from 'react';
import { useTrades } from '@/app/providers/TradeContext';

export function PlaybookBreakdownTable() {
  const { trades } = useTrades();

  const setupStats = useMemo(() => {
    const map = {};
    trades.forEach((t) => {
      if (!map[t.setup]) {
        map[t.setup] = { setup: t.setup, count: 0, wins: 0, netPnl: 0, totalR: 0 };
      }
      map[t.setup].count += 1;
      if (t.outcome === 'WIN') map[t.setup].wins += 1;
      map[t.setup].netPnl = Number((map[t.setup].netPnl + t.netPnl).toFixed(2));
      map[t.setup].totalR = Number((map[t.setup].totalR + t.rMultiple).toFixed(2));
    });
    return Object.values(map).sort((a, b) => b.netPnl - a.netPnl);
  }, [trades]);

  return (
    <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-pit-border">
        <h3 className="text-sm font-semibold text-white">Playbook Strategy Breakdown</h3>
        <p className="text-xs text-slate-400">Performance grouped by setup tags</p>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-pit-bg text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3 px-4">Setup Strategy</th>
            <th className="py-3 px-4 text-right">Trades</th>
            <th className="py-3 px-4 text-right">Win Rate</th>
            <th className="py-3 px-4 text-right">Avg R-Mult</th>
            <th className="py-3 px-4 text-right">Net P&L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pit-border">
          {setupStats.map((s) => {
            const wr = Math.round((s.wins / s.count) * 100);
            const avgR = (s.totalR / s.count).toFixed(2);
            return (
              <tr key={s.setup} className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-white">{s.setup}</td>
                <td className="py-3 px-4 text-right font-mono">{s.count}</td>
                <td className="py-3 px-4 text-right font-mono text-indigo-400">{wr}%</td>
                <td className="py-3 px-4 text-right font-mono">{avgR}R</td>
                <td className={`py-3 px-4 text-right font-mono font-bold ${s.netPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'}`}>
                  {s.netPnl >= 0 ? '+' : ''}${s.netPnl.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}