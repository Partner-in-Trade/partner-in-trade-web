import React from 'react';

export function RecentTradesTable({ trades, onSelectTrade }) {
  const recent = [...trades].sort((a, b) =>
    `${b.date} ${b.entryTime}`.localeCompare(`${a.date} ${a.entryTime}`)
  ).slice(0, 6);

  return (
    <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-pit-border">
        <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-pit-bg text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3 px-4">Date</th><th className="py-3 px-4">Symbol</th>
            <th className="py-3 px-4">Side</th><th className="py-3 px-4">Setup</th>
            <th className="py-3 px-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pit-border">
          {recent.map((trade) => (
            <tr key={trade.id} onClick={() => onSelectTrade(trade)}
              className="hover:bg-slate-800/40 cursor-pointer transition">
              <td className="py-3 px-4 font-mono text-xs text-slate-300">{trade.date}</td>
              <td className="py-3 px-4 font-bold text-white">{trade.symbol}</td>
              <td className="py-3 px-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${trade.direction === 'LONG' ? 'bg-emerald-500/10 text-pit-profit' : 'bg-rose-500/10 text-pit-loss'}`}>{trade.direction}</span></td>
              <td className="py-3 px-4 text-slate-300 text-xs">{trade.setup}</td>
              <td className="py-3 px-4 text-center">
                <span className={`text-xs rounded px-2 py-1 ${trade.exitPrice !== '' ? 'bg-slate-700 text-slate-200' : 'bg-amber-500/10 text-amber-300'}`}>
                  {trade.exitPrice !== '' ? 'CLOSED' : 'OPEN'}
                </span>
              </td>
            </tr>
          ))}
          {recent.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-sm text-slate-400">No trades yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
