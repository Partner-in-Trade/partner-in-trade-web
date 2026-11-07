import React from 'react';
import { getNowTimeLabel } from '@/features/news/utils/newsDayTimeline';

export function NewsNowMarker({ now }) {
  const timeLabel = getNowTimeLabel(now);

  return (
    <li className="relative pl-[4.5rem] py-3 list-none" aria-label={`Current time ${timeLabel}`}>
      <span className="absolute left-[3.25rem] top-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.3)] z-10" />
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-12 text-right font-mono text-xs text-indigo-300 tabular-nums">
        {timeLabel}
      </span>
      <div className="relative flex items-center gap-2 ml-0">
        <div className="h-px flex-1 bg-indigo-500/70" />
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-indigo-200 bg-indigo-500/15 border border-indigo-500/35 shrink-0">
          Now
        </span>
        <div className="h-px flex-1 bg-indigo-500/70" />
      </div>
    </li>
  );
}
