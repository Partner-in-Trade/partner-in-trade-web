import React from 'react';
import { NewsCurrencyPills } from './NewsCurrencyPills';
import { summarizeImpactMix } from '@/features/news/utils/newsDayTimeline';
import { formatNewsMonthDay } from '@/features/news/utils/weekRangeLabel';

function ImpactMixBar({ mix }) {
  const total = mix.high + mix.medium + mix.low;
  if (total === 0) {
    return <div className="h-1.5 rounded-full bg-slate-800/80" />;
  }

  const segments = [
    { key: 'high', count: mix.high, className: 'bg-rose-500' },
    { key: 'medium', count: mix.medium, className: 'bg-amber-500' },
    { key: 'low', count: mix.low, className: 'bg-yellow-500/85' },
  ].filter((s) => s.count > 0);

  return (
    <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-800/80">
      {segments.map((s) => (
        <div
          key={s.key}
          className={s.className}
          style={{ width: `${(s.count / total) * 100}%` }}
          title={`${s.key}: ${s.count}`}
        />
      ))}
    </div>
  );
}

export function NewsSideRail({
  glanceTitle,
  dayEvents,
  currencies,
  weekRows,
  onSelectDay,
  onViewFullWeek,
  journalPrompt,
  onAddJournalNote,
}) {
  const mix = summarizeImpactMix(dayEvents);

  return (
    <aside className="space-y-4">
      <div className="bg-[#141922]/90 border border-slate-700/80 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{glanceTitle}</h3>
        <div>
          <ImpactMixBar mix={mix} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-[11px] text-slate-500">
            {mix.high > 0 ? <span><span className="text-rose-400 font-semibold">{mix.high}</span> High</span> : null}
            {mix.medium > 0 ? (
              <span><span className="text-amber-400 font-semibold">{mix.medium}</span> Medium</span>
            ) : null}
            {mix.low > 0 ? <span><span className="text-yellow-500/90 font-semibold">{mix.low}</span> Low</span> : null}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Currencies in play
          </p>
          <NewsCurrencyPills currencies={currencies} />
        </div>
      </div>

      <div className="bg-[#141922]/90 border border-slate-700/80 rounded-xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Rest of the week</h3>
        <ul className="space-y-0.5">
          {weekRows.map((row) => (
            <li key={row.date}>
              <button
                type="button"
                onClick={() => onSelectDay(row.date)}
                className={`w-full text-left px-2 py-2 rounded-lg text-sm transition flex items-center justify-between gap-2 ${
                  row.isToday
                    ? 'bg-yellow-400/12 text-slate-200 ring-1 ring-yellow-400/25'
                    : row.isSelected
                      ? 'bg-indigo-500/10 text-indigo-100'
                      : 'text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 w-7 shrink-0">{row.label}</span>
                  <span className="truncate">{formatNewsMonthDay(row.date)}</span>
                </span>
                <span className="text-xs text-slate-500 shrink-0">{row.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onViewFullWeek}
          className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          View full week →
        </button>
      </div>

      <div className="bg-[#141922]/90 border border-slate-700/80 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">{journalPrompt.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{journalPrompt.body}</p>
        <button
          type="button"
          onClick={onAddJournalNote}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-lg shadow-indigo-900/30"
        >
          Add journal note
        </button>
      </div>
    </aside>
  );
}
