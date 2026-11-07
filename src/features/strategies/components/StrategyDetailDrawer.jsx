import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Target, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSelectedMarket, setSelectedTrade } from '@/app/store';
import { OutcomeBadge } from '@/components/ui/OutcomeBadge';
import { strategiesApi } from '@/features/strategies/api/strategiesApi';
import { apiTradeToUi } from '@/lib/mappers/tradeMapper';
import {
  performanceForStrategy,
  winRatePercent,
  buildStrategyPerformanceMap,
} from '@/features/strategies/utils/strategyPerformance';

function DetailBlock({ label, children }) {
  if (children == null || children === '' || (Array.isArray(children) && children.length === 0)) {
    return null;
  }
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200">{children}</dd>
    </div>
  );
}

function formatPnl(amount, currency) {
  const sym = currency === 'INR' ? '₹' : '$';
  const n = Number(amount) || 0;
  const formatted = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return `${n >= 0 ? '+' : '-'}${sym}${formatted}`;
}

export function StrategyDetailDrawer({ open, strategy, onClose }) {
  const dispatch = useDispatch();
  const selectedMarket = useSelector(selectSelectedMarket);
  const currency = selectedMarket?.currency || 'USD';

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || strategy?.id == null) {
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setTrades([]);

    strategiesApi
      .getTrades(strategy.id)
      .then((tradesRes) => {
        if (cancelled) return;
        const rows = (tradesRes.data || []).map((t) => apiTradeToUi(t));
        setTrades(rows);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.response?.data?.message || e.message || 'Failed to load trades');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, strategy?.id]);

  const perf = useMemo(() => {
    if (!strategy) return { tradeCount: 0, wins: 0, netPnl: 0 };
    return performanceForStrategy(buildStrategyPerformanceMap(trades), strategy);
  }, [strategy, trades]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close strategy details"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-pit-border bg-pit-card shadow-2xl animate-slide-in-right">
        <header className="flex shrink-0 items-center gap-3 border-b border-pit-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-pit-bg hover:text-white"
            aria-label="Back to strategies"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20">
              <Target className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white">
                {strategy?.name || 'Strategy'}
              </h2>
              <p className="text-xs text-slate-400">Playbook details & linked trades</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-pit-bg hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}
          {strategy && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-pit-border bg-pit-bg px-3 py-3 text-center">
                  <div className="text-lg font-semibold text-white">{perf.tradeCount}</div>
                  <div className="text-[10px] uppercase text-slate-500">Trades</div>
                </div>
                <div className="rounded-xl border border-pit-border bg-pit-bg px-3 py-3 text-center">
                  <div className="text-lg font-semibold text-indigo-400">
                    {perf.tradeCount ? `${winRatePercent(perf)}%` : '—'}
                  </div>
                  <div className="text-[10px] uppercase text-slate-500">Win rate</div>
                </div>
                <div className="rounded-xl border border-pit-border bg-pit-bg px-3 py-3 text-center">
                  <div
                    className={`text-lg font-semibold ${
                      perf.netPnl >= 0 ? 'text-pit-profit' : 'text-pit-loss'
                    }`}
                  >
                    {perf.tradeCount ? formatPnl(perf.netPnl, currency) : '—'}
                  </div>
                  <div className="text-[10px] uppercase text-slate-500">Net P&L</div>
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailBlock label="Description">{strategy.description}</DetailBlock>
                <DetailBlock label="Type">{strategy.type}</DetailBlock>
                <DetailBlock label="Market types">
                  {(strategy.marketTypes || []).join(', ') || null}
                </DetailBlock>
                <DetailBlock label="Status">
                  {strategy.isActive ? 'Active' : 'Draft'}
                </DetailBlock>
                <DetailBlock label="Primary timeframe">{strategy.timeframe}</DetailBlock>
                <DetailBlock label="Timeframes">
                  {(strategy.timeframes || []).join(', ') || null}
                </DetailBlock>
                <DetailBlock label="Sessions">
                  {(strategy.sessions || []).join(', ') || null}
                </DetailBlock>
                <DetailBlock label="Tags">
                  {(strategy.tags || []).length ? (
                    <span className="flex flex-wrap gap-1">
                      {strategy.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] text-indigo-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </DetailBlock>
                <DetailBlock label="Setup rules">{strategy.rulesSetup}</DetailBlock>
                <DetailBlock label="Risk notes">{strategy.riskNotes}</DetailBlock>
              </dl>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Trades using this strategy
                </h3>
                {loading ? (
                  <p className="rounded-xl border border-dashed border-pit-border py-8 text-center text-sm text-slate-500">
                    Loading trades…
                  </p>
                ) : trades.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-pit-border py-8 text-center text-sm text-slate-500">
                    No trades logged with this strategy yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-pit-border">
                    <table className="w-full text-left text-sm min-w-[520px]">
                      <thead className="bg-pit-bg text-xs uppercase text-slate-400">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Symbol</th>
                          <th className="py-2.5 px-3">Market</th>
                          <th className="py-2.5 px-3 text-right">R</th>
                          <th className="py-2.5 px-3 text-right">Net P&L</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pit-border">
                        {trades.map((t) => (
                          <tr
                            key={t.id}
                            className="cursor-pointer hover:bg-slate-800/40"
                            onClick={() => {
                              dispatch(setSelectedTrade(t));
                            }}
                          >
                            <td className="py-2.5 px-3 font-mono text-xs text-slate-300">
                              {t.date}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">{t.symbol}</td>
                            <td className="py-2.5 px-3 text-xs text-slate-400">
                              {t.marketName || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-xs">
                              {t.rMultiple == null ? '—' : `${Number(t.rMultiple).toFixed(2)}R`}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-mono text-xs font-semibold ${
                                t.netPnl == null
                                  ? 'text-slate-400'
                                  : t.netPnl >= 0
                                    ? 'text-pit-profit'
                                    : 'text-pit-loss'
                              }`}
                            >
                              {t.netPnl == null
                                ? '—'
                                : formatPnl(t.netPnl, t.currency || currency)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <OutcomeBadge outcome={t.outcome} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
