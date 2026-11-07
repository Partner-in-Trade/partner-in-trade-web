import React from 'react';
import { Star } from 'lucide-react';
import { StrategySparkline } from './StrategySparkline';
import { statusLabel } from '@/features/strategies/utils/strategyStatus';

const AVATAR_PALETTE = [
  { box: 'bg-amber-950/80 border-amber-900/50', text: 'text-amber-400' },
  { box: 'bg-violet-950/80 border-violet-900/50', text: 'text-violet-300' },
  { box: 'bg-emerald-950/80 border-emerald-900/50', text: 'text-emerald-300' },
  { box: 'bg-sky-950/80 border-sky-900/50', text: 'text-sky-300' },
  { box: 'bg-rose-950/80 border-rose-900/50', text: 'text-rose-300' },
  { box: 'bg-indigo-950/80 border-indigo-900/50', text: 'text-indigo-300' },
];

function strategyInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function avatarStyle(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i += 1) hash = (hash + name.charCodeAt(i)) % 997;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function statusDotClass(status) {
  switch (status) {
    case 'active':
      return 'bg-emerald-400';
    case 'draft':
      return 'bg-slate-500';
    default:
      return 'bg-slate-500';
  }
}

function statusTextClass(status) {
  switch (status) {
    case 'active':
      return 'text-emerald-400';
    case 'draft':
      return 'text-slate-400';
    default:
      return 'text-slate-400';
  }
}

function rulesBarClass(percent) {
  if (percent == null) return 'bg-slate-600';
  if (percent >= 70) return 'bg-emerald-500';
  if (percent >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}

export function StrategyCard({
  strategy,
  perf,
  winRate,
  status,
  pinned,
  currency,
  equitySeries,
  rulesPercent,
  marketTypes,
  timeframeLabel,
  formatPnl,
  onTogglePin,
  onOpenPlaybook,
  onLogTrade,
}) {
  const positive = perf.netPnl >= 0;
  const hasTrades = perf.tradeCount > 0;
  const avatar = avatarStyle(strategy.name);

  return (
    <article className="flex flex-col rounded-2xl border border-violet-500/45 bg-pit-card p-5 shadow-[0_0_0_1px_rgba(139,92,246,0.08)]">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-base font-bold ${avatar.box} ${avatar.text}`}
        >
          {strategyInitial(strategy.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold text-white" title={strategy.name}>
              {strategy.name}
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin?.();
              }}
              className="shrink-0 rounded-md p-1 text-slate-500 hover:text-amber-300"
              aria-label={pinned ? 'Unpin strategy' : 'Pin strategy'}
            >
              <Star
                className={`h-4 w-4 ${pinned ? 'fill-amber-400 text-amber-400' : ''}`}
                strokeWidth={pinned ? 0 : 2}
              />
            </button>
          </div>
          <div
            className={`mt-1 flex items-center gap-1.5 text-[11px] font-medium ${statusTextClass(status)}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(status)}`} aria-hidden />
            {statusLabel(status)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(marketTypes || []).map((label) => (
          <span
            key={label}
            className="rounded-md bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-300"
          >
            {label}
          </span>
        ))}
        {timeframeLabel ? (
          <span className="rounded-md bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-300">
            {timeframeLabel}
          </span>
        ) : null}
      </div>

      {strategy.description ? (
        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-400">{strategy.description}</p>
      ) : (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600 italic">No description yet.</p>
      )}

      <div className="mt-4 border-t border-pit-border/70 pt-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Trades</div>
            <div className="mt-1 font-mono text-lg font-semibold text-white">{perf.tradeCount}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Win rate</div>
            <div className="mt-1 font-mono text-lg font-semibold text-violet-300">
              {hasTrades ? `${winRate}%` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Net P&L</div>
            <div
              className={`mt-1 font-mono text-lg font-bold ${
                !hasTrades ? 'text-slate-500' : positive ? 'text-pit-profit' : 'text-pit-loss'
              }`}
            >
              {hasTrades ? formatPnl(perf.netPnl, currency) : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg bg-pit-bg/50 px-1 pt-1">
        <StrategySparkline values={equitySeries} positive={!hasTrades ? true : positive} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Rules followed</span>
          <span
            className={`font-mono font-medium ${
              rulesPercent == null ? 'text-slate-500' : 'text-emerald-400'
            }`}
          >
            {rulesPercent == null ? '—' : `${rulesPercent}%`}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${rulesBarClass(rulesPercent)}`}
            style={{ width: rulesPercent == null ? '0%' : `${Math.min(100, rulesPercent)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLogTrade?.();
          }}
          className="rounded-xl border border-pit-border bg-pit-bg py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800/80"
        >
          Log trade
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPlaybook?.();
          }}
          className="rounded-xl border border-violet-500/30 bg-violet-950/60 py-2.5 text-xs font-semibold text-violet-100 hover:bg-violet-900/50"
        >
          Open playbook
        </button>
      </div>
    </article>
  );
}
