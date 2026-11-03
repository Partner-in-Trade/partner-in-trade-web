import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectEnrichedTrades } from '@/app/store';

export function PlaybookBreakdownTable() {
  const trades = useSelector(selectEnrichedTrades);

  const setupStats = useMemo(() => {
    const map = {};
    trades.forEach((trade) => {
      if (trade.isOpen) return;

      const setup = trade.setup || 'Uncategorized';
      if (!map[setup]) {
        map[setup] = {
          setup,
          count: 0,
          wins: 0,
          netPnl: 0,
          totalR: 0,
          validRCount: 0,
        };
      }

      const stats = map[setup];
      const pnl = Number(trade.netPnl) || 0;
      stats.count += 1;
      if (pnl > 0) stats.wins += 1;
      stats.netPnl = Number((stats.netPnl + pnl).toFixed(2));

      if (Number(trade.initialRiskDollars) > 0 && Number.isFinite(Number(trade.rMultiple))) {
        stats.totalR += Number(trade.rMultiple);
        stats.validRCount += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.netPnl - a.netPnl);
  }, [trades]);

  return (
    <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-pit-border">
        <h3 className="text-sm font-semibold text-white">Playbook Strategy Breakdown</h3>
        <p className="text-xs text-slate-400">Closed-trade performance grouped by setup tags</p>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-pit-bg text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3 px-4">Setup Strategy</th>
            <th className="py-3 px-4 text-right">Closed Trades</th>
            <th className="py-3 px-4 text-right">Win Rate</th>
            <th className="py-3 px-4 text-right">Avg R-Mult</th>
            <th className="py-3 px-4 text-right">Net P&amp;L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pit-border">
          {setupStats.map((stats) => {
            const winRate = Math.round((stats.wins / stats.count) * 100);
            const avgR = stats.validRCount > 0
              ? `${(stats.totalR / stats.validRCount).toFixed(2)}R`
              : '—';

            return (
              <tr key={stats.setup} className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-white">{stats.setup}</td>
                <td className="py-3 px-4 text-right font-mono">{stats.count}</td>
                <td className="py-3 px-4 text-right font-mono text-indigo-400">{winRate}%</td>
                <td className="py-3 px-4 text-right font-mono">{avgR}</td>
                <td className={`py-3 px-4 text-right font-mono font-bold ${stats.netPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'}`}>
                  {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toFixed(2)}
                </td>
              </tr>
            );
          })}
          {setupStats.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 px-4 text-center text-sm text-slate-400">
                No closed trades to analyze yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
