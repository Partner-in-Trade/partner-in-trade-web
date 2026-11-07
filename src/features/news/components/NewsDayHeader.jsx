import React from 'react';
import { formatNewsDayTitle, formatWeekRangeLabelFromIso } from '@/features/news/utils/weekRangeLabel';
import { NewsImpactFilter } from './NewsImpactFilter';

export function NewsDayHeader({
  selectedDay,
  todayIso,
  weekRangeLabel,
  impactFilter,
  onImpactFilterChange,
  summary,
}) {
  const isToday = selectedDay === todayIso;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {isToday ? (
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/25 text-indigo-200 font-bold uppercase tracking-wider border border-indigo-500/40">
            Today
          </span>
        ) : null}
        <span className="text-slate-500">{weekRangeLabel}</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{formatNewsDayTitle(selectedDay)}</h2>
        <p className="text-sm text-slate-500 mt-1.5">
          {summary.total} events · {summary.highImpact} high-impact · {summary.upcoming} still to come
        </p>
      </div>

      <NewsImpactFilter value={impactFilter} onChange={onImpactFilterChange} />
    </div>
  );
}
