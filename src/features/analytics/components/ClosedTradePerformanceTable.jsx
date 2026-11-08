import React from 'react';
import { useSelector } from 'react-redux';
import { selectAnalytics, selectAnalyticsLoading } from '@/app/store';

const OUTCOME_STYLES = {
  WIN: 'bg-emerald-500/10 text-emerald-400',
  LOSS: 'bg-rose-500/10 text-rose-400',
  BREAKEVEN: 'bg-slate-500/15 text-slate-300',
};

function formatMoney(value, currency) {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch {
    return `${currency || ''} ${Number(value).toFixed(2)}`.trim();
  }
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function ClosedTradePerformanceTable() {
  const analytics = useSelector(selectAnalytics);
  const loading = useSelector(selectAnalyticsLoading);
  const rows = analytics?.tradePerformance || [];
  const currency = analytics?.currency || 'USD';

  return (
    <section className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-pit-border">
        <h3 className="text-sm font-semibold text-white">Closed Trade Performance</h3>
        <p className="text-xs text-slate-400">Individual trade results calculated by the backend</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-pit-bg text-xs uppercase text-slate-400">
            <tr>
              <th scope="col" className="py-3 px-4">Date</th>
              <th scope="col" className="py-3 px-4">Symbol</th>
              <th scope="col" className="py-3 px-4 text-right">Net P&amp;L</th>
              <th scope="col" className="py-3 px-4 text-right">R-Multiple</th>
              <th scope="col" className="py-3 px-4 text-right">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pit-border">
            {rows.map((trade) => {
              const outcome = String(trade.outcome || '').toUpperCase();
              const outcomeStyle = OUTCOME_STYLES[outcome] || 'bg-slate-500/15 text-slate-300';
              return (
                <tr key={trade.tradeId} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-300">{formatDate(trade.date)}</td>
                  <td className="py-3 px-4 font-semibold text-white">{trade.symbol || '—'}</td>
                  <td className={`py-3 px-4 text-right font-mono font-semibold ${Number(trade.netPnl) > 0 ? 'text-pit-profit' : Number(trade.netPnl) < 0 ? 'text-pit-loss' : 'text-slate-300'}`}>
                    {formatMoney(trade.netPnl, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {trade.rMultiple == null ? '—' : `${Number(trade.rMultiple).toFixed(2)}R`}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${outcomeStyle}`}>
                      {outcome || 'UNKNOWN'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-sm text-slate-400">
                  No closed trades to analyze yet.
                </td>
              </tr>
            )}
            {loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-sm text-slate-400">
                  Loading closed trades…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
