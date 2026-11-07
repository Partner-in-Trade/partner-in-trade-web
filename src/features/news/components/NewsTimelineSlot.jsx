import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { ImpactBadge, ImpactBar } from './ImpactBadge';
import { formatEventTime, formatValue } from '@/features/news/utils/weekRangeLabel';
import { compareActualToForecast, formatCountdown } from '@/features/news/utils/newsDayTimeline';

function ColumnHeaders() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-3 items-end pb-2 border-b border-slate-700/50 mb-1">
      <div />
      <div className="grid grid-cols-3 gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500 text-right">
        <span>Actual</span>
        <span>Fcst</span>
        <span>Prev</span>
      </div>
    </div>
  );
}

function EventRow({ event, isPast }) {
  const direction = isPast ? compareActualToForecast(event.actual, event.forecast) : null;
  const actualClass =
    direction === 'up'
      ? 'text-pit-profit'
      : direction === 'down'
        ? 'text-pit-loss'
        : 'text-slate-300';

  const actualDisplay = isPast ? formatValue(event.actual) : '—';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-3 items-center py-2.5 border-b border-slate-800/60 last:border-0">
      <div className="flex items-stretch gap-2.5 min-w-0">
        <ImpactBar impact={event.impact} />
        <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-xs font-bold text-slate-200">{event.currency}</span>
          <span className="text-slate-600">|</span>
          <span className="text-sm text-slate-300 truncate">{event.eventName}</span>
          <ImpactBadge impact={event.impact} compact />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 text-right font-mono text-xs tabular-nums">
        <span className={`flex items-center justify-end gap-0.5 ${actualClass}`}>
          {actualDisplay}
          {direction === 'up' ? <ArrowUp className="w-3 h-3 shrink-0" aria-hidden /> : null}
          {direction === 'down' ? <ArrowDown className="w-3 h-3 shrink-0" aria-hidden /> : null}
        </span>
        <span className="text-slate-300">{formatValue(event.forecast)}</span>
        <span className="text-slate-500">{formatValue(event.previous)}</span>
      </div>
    </div>
  );
}

export function NewsTimelineSlot({ slot, eventDate, now, isNextUp, isPast }) {
  const timeLabel = formatEventTime(slot.time);
  const countdown = !isPast ? formatCountdown(eventDate, slot.time, now) : null;
  const isCluster = slot.isCluster;
  const hasHigh = slot.events.some((e) => e.impact === 'HIGH');
  const isKeyWindow = isCluster && hasHigh;

  let nodeClass = 'bg-transparent border-2 border-slate-600';
  if (isNextUp) {
    nodeClass = 'bg-indigo-500 border-2 border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.25)]';
  } else if (isKeyWindow && !isPast) {
    nodeClass = 'bg-rose-500 border-2 border-rose-400 shadow-[0_0_0_3px_rgba(244,63,94,0.2)]';
  } else if (isPast) {
    nodeClass = 'bg-slate-500 border-2 border-slate-500';
  } else if (!isPast) {
    nodeClass = 'bg-transparent border-2 border-slate-600';
  }

  const cardBorder = isKeyWindow && !isPast
    ? 'border-rose-500/45 ring-1 ring-rose-500/20'
    : isNextUp
      ? 'border-indigo-500/50 ring-1 ring-indigo-500/25'
      : 'border-slate-700/80';

  let headerLabel = null;
  if (isNextUp && countdown) {
    headerLabel = `Next up · ${countdown}`;
  } else if (isKeyWindow && countdown) {
    headerLabel = `Key window · ${slot.events.length} releases · ${countdown}`;
  } else if (isKeyWindow) {
    headerLabel = `Key window · ${slot.events.length} releases`;
  }

  return (
    <li className="relative pl-[4.5rem] pb-6 list-none last:pb-2">
      <span
        className={`absolute left-[3.25rem] top-4 -translate-x-1/2 w-2.5 h-2.5 rounded-full z-10 ${nodeClass}`}
        aria-hidden
      />
      <span className="absolute left-0 top-3.5 w-[3.25rem] pr-3 text-right font-mono text-xs text-slate-500 tabular-nums">
        {timeLabel}
      </span>
      <div className={`rounded-xl border bg-[#141922]/90 px-4 py-3 ${cardBorder}`}>
        {headerLabel ? (
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${
              isKeyWindow ? 'text-rose-400/90' : 'text-indigo-300'
            }`}
          >
            {headerLabel}
          </p>
        ) : null}
        <ColumnHeaders />
        <div>
          {slot.events.map((event) => (
            <EventRow key={event.id} event={event} isPast={isPast} />
          ))}
        </div>
      </div>
    </li>
  );
}
