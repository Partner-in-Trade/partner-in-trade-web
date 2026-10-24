import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchThisWeekNews,
  selectNewsEvents,
  selectNewsLoading,
  selectNewsError,
  selectNewsFetchedAt,
} from '@/app/store';
import { groupEventsByDate } from '@/features/news/utils/groupEventsByDate';
import {
  formatEventDateHeader,
  formatEventTime,
  formatValue,
  getThisWeekRangeLabel,
} from '@/features/news/utils/weekRangeLabel';
import { ImpactBadge } from '@/features/news/components/ImpactBadge';

const COL_COUNT = 7;

export function NewsCalendarView() {
  const dispatch = useDispatch();
  const events = useSelector(selectNewsEvents);
  const loading = useSelector(selectNewsLoading);
  const error = useSelector(selectNewsError);
  const fetchedAt = useSelector(selectNewsFetchedAt);
  const grouped = groupEventsByDate(events);
  const weekLabel = getThisWeekRangeLabel();

  useEffect(() => {
    if (fetchedAt === null) {
      dispatch(fetchThisWeekNews());
    }
  }, [dispatch, fetchedAt]);

  return (
    <div className="space-y-4">
      <div className="bg-pit-card border border-pit-border rounded-xl p-4">
        <p className="text-sm text-slate-300">This week&apos;s economic events</p>
        <p className="text-xs text-slate-500 mt-0.5">{weekLabel}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="bg-pit-card border border-pit-border rounded-xl overflow-hidden">
        {loading && events.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading calendar…</div>
        ) : !loading && events.length === 0 && !error ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No economic events scheduled this week.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-pit-bg text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4 w-20">Time</th>
                <th className="py-3 px-4 w-24">Cur.</th>
                <th className="py-3 px-4 w-28">Impact</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4 text-right w-24">Actual</th>
                <th className="py-3 px-4 text-right w-24">Forecast</th>
                <th className="py-3 px-4 text-right w-24">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pit-border">
              {grouped.map(({ date, events: dayEvents }) => (
                <React.Fragment key={date}>
                  <tr className="bg-pit-bg/80">
                    <td
                      colSpan={COL_COUNT}
                      className="py-2.5 px-4 text-xs font-semibold uppercase tracking-wide text-slate-300"
                    >
                      {formatEventDateHeader(date)}
                    </td>
                  </tr>
                  {dayEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-xs text-slate-300">
                        {formatEventTime(ev.eventTime)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">{ev.currency}</span>
                        {ev.country ? (
                          <span className="block text-[10px] text-slate-500">{ev.country}</span>
                        ) : null}
                      </td>
                      <td className="py-3 px-4">
                        <ImpactBadge impact={ev.impact} />
                      </td>
                      <td className="py-3 px-4 text-slate-200">{ev.eventName}</td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-white">
                        {formatValue(ev.actual)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-300">
                        {formatValue(ev.forecast)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">
                        {formatValue(ev.previous)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
