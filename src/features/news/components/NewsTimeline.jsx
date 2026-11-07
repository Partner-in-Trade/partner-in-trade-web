import React, { useEffect, useState } from 'react';
import { NewsNowMarker } from './NewsNowMarker';
import { NewsTimelineSlot } from './NewsTimelineSlot';
import {
  getNextUpSlot,
  getNowMarkerInsertIndex,
  isSlotPast,
} from '@/features/news/utils/newsDayTimeline';

export function NewsTimeline({ slots, eventDate, showNowMarker }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const nextUp = getNextUpSlot(slots, eventDate, now);
  const nowIndex = showNowMarker ? getNowMarkerInsertIndex(slots, eventDate, now) : -1;

  if (!slots.length) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center border border-dashed border-slate-700/60 rounded-xl bg-[#141922]/40">
        No events match this filter for this day.
      </p>
    );
  }

  const items = [];
  slots.forEach((slot, index) => {
    if (showNowMarker && index === nowIndex) {
      items.push(<NewsNowMarker key="now-marker" now={now} />);
    }
    const isPast = isSlotPast(eventDate, slot.time, now);
    const isNextUp = nextUp === slot;
    items.push(
      <NewsTimelineSlot
        key={`${slot.time}-${index}`}
        slot={slot}
        eventDate={eventDate}
        now={now}
        isNextUp={isNextUp}
        isPast={isPast}
      />
    );
  });

  if (showNowMarker && nowIndex === slots.length) {
    items.push(<NewsNowMarker key="now-marker-end" now={now} />);
  }

  return (
    <div className="relative">
      <div
        className="absolute left-[3.25rem] top-3 bottom-3 w-px bg-slate-700/70 -translate-x-1/2"
        aria-hidden
      />
      <ul className="relative m-0 p-0">{items}</ul>
    </div>
  );
}
