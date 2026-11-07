import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchThisWeekNews,
  selectNewsEvents,
  selectNewsLoading,
  selectNewsError,
  selectNewsFetchedAt,
  setActiveTab,
} from '@/app/store';
import { openWriteJournal } from '@/app/store/slices/journalSlice';
import { groupEventsByDate } from '@/features/news/utils/groupEventsByDate';
import { normalizeNewsEvents } from '@/features/news/utils/normalizeNewsEvent';
import { NewsDayHeader } from '@/features/news/components/NewsDayHeader';
import { NewsTimeline } from '@/features/news/components/NewsTimeline';
import { NewsSideRail } from '@/features/news/components/NewsSideRail';
import {
  buildJournalPrompt,
  buildWeekDayRows,
  countCurrencies,
  filterEventsByImpact,
  getTodayIsoInNewsTz,
  getWeekBoundsFromEvents,
  groupEventsByTimeSlot,
  resolveSelectedNewsDay,
  summarizeDay,
} from '@/features/news/utils/newsDayTimeline';
import { formatWeekRangeLabelFromIso, getThisWeekRangeLabel } from '@/features/news/utils/weekRangeLabel';

export function NewsCalendarView() {
  const dispatch = useDispatch();
  const events = useSelector(selectNewsEvents);
  const loading = useSelector(selectNewsLoading);
  const error = useSelector(selectNewsError);
  const fetchedAt = useSelector(selectNewsFetchedAt);

  const todayIso = useMemo(() => getTodayIsoInNewsTz(), []);

  const normalizedEvents = useMemo(() => normalizeNewsEvents(events), [events]);

  const [selectedDay, setSelectedDay] = useState(todayIso);
  const [impactFilter, setImpactFilter] = useState('ALL');

  const grouped = useMemo(() => groupEventsByDate(normalizedEvents), [normalizedEvents]);

  const dayEventsRaw = useMemo(() => {
    const group = grouped.find((g) => g.date === selectedDay);
    return group?.events ?? [];
  }, [grouped, selectedDay]);

  const dayEventsFiltered = useMemo(
    () => filterEventsByImpact(dayEventsRaw, impactFilter),
    [dayEventsRaw, impactFilter]
  );

  const slots = useMemo(
    () => groupEventsByTimeSlot(dayEventsFiltered),
    [dayEventsFiltered]
  );

  const summary = useMemo(
    () => summarizeDay(dayEventsRaw, selectedDay),
    [dayEventsRaw, selectedDay]
  );

  const currencies = useMemo(() => countCurrencies(dayEventsRaw), [dayEventsRaw]);

  const weekBounds = useMemo(
    () => getWeekBoundsFromEvents(normalizedEvents),
    [normalizedEvents]
  );

  const weekRangeLabel = useMemo(() => {
    if (weekBounds) {
      return formatWeekRangeLabelFromIso(weekBounds.monday, weekBounds.sunday);
    }
    return getThisWeekRangeLabel();
  }, [weekBounds]);

  const weekRows = useMemo(
    () => buildWeekDayRows(normalizedEvents, selectedDay, todayIso),
    [normalizedEvents, selectedDay, todayIso]
  );

  const journalPrompt = useMemo(
    () => buildJournalPrompt(dayEventsRaw, selectedDay),
    [dayEventsRaw, selectedDay]
  );

  const glanceTitle = selectedDay === todayIso ? 'Today at a glance' : 'Day at a glance';

  useEffect(() => {
    if (fetchedAt === null) {
      dispatch(fetchThisWeekNews());
    }
  }, [dispatch, fetchedAt]);

  /** Align selected day with loaded event dates (not necessarily the IST calendar week). */
  useEffect(() => {
    if (!normalizedEvents.length) return;
    setSelectedDay((current) => resolveSelectedNewsDay(normalizedEvents, todayIso, current));
  }, [normalizedEvents, todayIso]);

  const handleViewFullWeek = () => {
    if (weekBounds && todayIso >= weekBounds.monday && todayIso <= weekBounds.sunday) {
      setSelectedDay(todayIso);
      return;
    }
    if (weekBounds) {
      setSelectedDay(weekBounds.monday);
    } else {
      setSelectedDay(todayIso);
    }
  };

  const handleAddJournalNote = () => {
    dispatch(openWriteJournal(selectedDay));
    dispatch(setActiveTab('journal'));
  };

  if (loading && normalizedEvents.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-400 bg-pit-card border border-pit-border rounded-xl">
        Loading calendar…
      </div>
    );
  }

  if (!loading && normalizedEvents.length === 0 && !error) {
    return (
      <div className="py-16 text-center text-sm text-slate-400 bg-pit-card border border-pit-border rounded-xl">
        No economic events scheduled this week.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <NewsDayHeader
            selectedDay={selectedDay}
            todayIso={todayIso}
            weekRangeLabel={weekRangeLabel}
            impactFilter={impactFilter}
            onImpactFilterChange={setImpactFilter}
            summary={summary}
          />
          <NewsTimeline
            slots={slots}
            eventDate={selectedDay}
            showNowMarker={selectedDay === todayIso}
          />
        </div>

        <NewsSideRail
          glanceTitle={glanceTitle}
          dayEvents={dayEventsRaw}
          currencies={currencies}
          weekRows={weekRows}
          onSelectDay={setSelectedDay}
          onViewFullWeek={handleViewFullWeek}
          journalPrompt={journalPrompt}
          onAddJournalNote={handleAddJournalNote}
        />
      </div>
    </div>
  );
}
