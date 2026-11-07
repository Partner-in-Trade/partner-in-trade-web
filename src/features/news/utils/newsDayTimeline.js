import { formatEventTime } from './weekRangeLabel';
import { normalizeEventDateIso } from './normalizeNewsEvent';

export const NEWS_TIME_ZONE = 'Asia/Kolkata';

export function getTodayIsoInNewsTz(referenceDate = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: NEWS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(referenceDate);
}

function startOfWeekMondayFromIso(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function addDaysToIso(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  date.setUTCDate(date.getUTCDate() + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function filterEventsByImpact(events, filter) {
  if (!events?.length) return [];
  if (!filter || filter === 'ALL') return events;
  return events.filter((e) => e.impact === filter);
}

/**
 * @param {Array<{ eventTime?: string }>} dayEvents sorted by API
 */
export function groupEventsByTimeSlot(dayEvents) {
  if (!dayEvents?.length) return [];

  const slots = [];
  let currentTime = null;
  let currentEvents = [];

  for (const event of dayEvents) {
    const time = event.eventTime || '00:00:00';
    if (time !== currentTime) {
      if (currentTime !== null) {
        slots.push({
          time: currentTime,
          events: currentEvents,
          isCluster: currentEvents.length > 1,
        });
      }
      currentTime = time;
      currentEvents = [event];
    } else {
      currentEvents.push(event);
    }
  }

  if (currentTime !== null) {
    slots.push({
      time: currentTime,
      events: currentEvents,
      isCluster: currentEvents.length > 1,
    });
  }

  return slots;
}

export function getEventInstantInNewsTz(eventDate, eventTime) {
  const time = eventTime || '00:00:00';
  const parts = time.split(':');
  const h = parts[0] ?? '00';
  const m = parts[1] ?? '00';
  const s = parts[2] ?? '00';
  return new Date(
    `${eventDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}+05:30`
  );
}

export function isSlotPast(eventDate, eventTime, now = new Date()) {
  return getEventInstantInNewsTz(eventDate, eventTime).getTime() <= now.getTime();
}

export function getNextUpSlot(slots, eventDate, now = new Date()) {
  if (!slots?.length) return null;
  for (const slot of slots) {
    if (!isSlotPast(eventDate, slot.time, now)) return slot;
  }
  return null;
}

export function formatCountdown(eventDate, eventTime, now = new Date()) {
  const target = getEventInstantInNewsTz(eventDate, eventTime);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `IN ${hours}H ${String(minutes).padStart(2, '0')}M`;
  }
  return `IN ${minutes}M`;
}

export function summarizeDay(events, eventDate, now = new Date()) {
  const list = events || [];
  const highImpact = list.filter((e) => e.impact === 'HIGH').length;
  const upcoming = list.filter((e) => !isSlotPast(eventDate, e.eventTime, now)).length;
  return {
    total: list.length,
    highImpact,
    upcoming,
  };
}

export function summarizeImpactMix(events) {
  const list = events || [];
  return {
    high: list.filter((e) => e.impact === 'HIGH').length,
    medium: list.filter((e) => e.impact === 'MEDIUM').length,
    low: list.filter((e) => e.impact === 'LOW').length,
  };
}

export function countCurrencies(events) {
  const map = {};
  for (const e of events || []) {
    if (!e.currency) continue;
    map[e.currency] = (map[e.currency] || 0) + 1;
  }
  return Object.entries(map)
    .map(([currency, count]) => ({ currency, count }))
    .sort((a, b) => b.count - a.count || a.currency.localeCompare(b.currency));
}

function slotHasHighImpact(slot) {
  return slot.events.some((e) => e.impact === 'HIGH');
}

export function buildJournalPrompt(events, eventDate, now = new Date()) {
  const dayEvents = events || [];
  const slots = groupEventsByTimeSlot(dayEvents);
  const highClusters = slots.filter((s) => s.isCluster && slotHasHighImpact(s));

  if (highClusters.length > 0) {
    const cluster = highClusters[0];
    const timeLabel = formatEventTime(cluster.time);
    const highCount = cluster.events.filter((e) => e.impact === 'HIGH').length;
    return {
      title: 'Plan around today’s news',
      body: `${highCount} high-impact release${highCount === 1 ? '' : 's'} land at ${timeLabel}. Jot down your plan before they print.`,
    };
  }

  const { highImpact } = summarizeDay(dayEvents, eventDate, now);
  if (highImpact > 0) {
    return {
      title: 'Plan around today’s news',
      body: `${highImpact} high-impact release${highImpact === 1 ? '' : 's'} on the calendar today. Jot down your plan before they print.`,
    };
  }

  return {
    title: 'Plan around today’s news',
    body: 'Review today’s releases and jot down how you’ll trade around them.',
  };
}

function isoDateWeekdayLabel(isoDate) {
  const dow = new Date(`${isoDate}T12:00:00Z`).getUTCDay();
  return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dow];
}

/** @param {Array<{ eventDate?: string, event_date?: unknown }>} events */
export function indexEventsByDate(events) {
  const map = {};
  for (const event of events || []) {
    const date = normalizeEventDateIso(event.eventDate ?? event.event_date);
    if (!date) continue;
    if (!map[date]) map[date] = [];
    map[date].push(event);
  }
  return map;
}

/**
 * Week grid bounds covering all event dates (Mon of first event week → Sun of last event week).
 * @returns {{ monday: string, sunday: string, minEventDate: string, maxEventDate: string } | null}
 */
export function getWeekBoundsFromEvents(events) {
  const dates = (events || [])
    .map((e) => normalizeEventDateIso(e.eventDate ?? e.event_date))
    .filter(Boolean)
    .sort();
  if (!dates.length) return null;

  const minEventDate = dates[0];
  const maxEventDate = dates[dates.length - 1];
  const monday = startOfWeekMondayFromIso(minEventDate);
  const sunday = addDaysToIso(startOfWeekMondayFromIso(maxEventDate), 6);

  return { monday, sunday, minEventDate, maxEventDate };
}

export function resolveSelectedNewsDay(events, todayIso, currentSelected) {
  const eventDates = [
    ...new Set(
      (events || [])
        .map((e) => normalizeEventDateIso(e.eventDate ?? e.event_date))
        .filter(Boolean)
    ),
  ].sort();

  if (!eventDates.length) {
    return currentSelected || todayIso;
  }

  if (currentSelected && eventDates.includes(currentSelected)) {
    return currentSelected;
  }

  const bounds = getWeekBoundsFromEvents(events);
  if (bounds && todayIso >= bounds.monday && todayIso <= bounds.sunday) {
    return todayIso;
  }

  return eventDates[0];
}

/**
 * @param {Array<{ eventDate?: string, event_date?: unknown }>} events normalized week events
 */
export function buildWeekDayRows(events, selectedDay, todayIso) {
  const bounds = getWeekBoundsFromEvents(events);
  const monday = bounds?.monday ?? startOfWeekMondayFromIso(todayIso);
  const sunday = bounds?.sunday ?? addDaysToIso(startOfWeekMondayFromIso(todayIso), 6);
  const eventsByDate = indexEventsByDate(events);

  const rows = [];
  let date = monday;

  while (date <= sunday) {
    const dayEvents = eventsByDate[date] || [];
    const count = dayEvents.length;
    const isSelected = date === selectedDay;
    const isToday = date === todayIso;
    const isPast = date < todayIso;
    const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let subtitle;
    if (isPast) {
      subtitle = count === 0 ? 'No events · done' : `${count} event${count === 1 ? '' : 's'} · done`;
    } else if (count === 0 && isWeekend) {
      subtitle = 'Markets closed';
    } else if (count === 0) {
      subtitle = 'No events';
    } else {
      subtitle = `${count} event${count === 1 ? '' : 's'}`;
    }

    rows.push({
      date,
      label: isoDateWeekdayLabel(date),
      count,
      isSelected,
      isToday,
      isPast,
      subtitle,
    });

    date = addDaysToIso(date, 1);
  }

  return rows;
}

function parseComparableNumber(value) {
  if (value == null || value === '' || value === '—') return null;
  const cleaned = String(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** @returns {'up' | 'down' | null} */
export function compareActualToForecast(actual, forecast) {
  const a = parseComparableNumber(actual);
  const f = parseComparableNumber(forecast);
  if (a == null || f == null) return null;
  if (a > f) return 'up';
  if (a < f) return 'down';
  return null;
}

export function getNowTimeLabel(now = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: NEWS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
}

/**
 * Index after which to insert the NOW marker (before slot at index), or slots.length if after all.
 */
export function getNowMarkerInsertIndex(slots, eventDate, now = new Date()) {
  if (!slots?.length) return 0;
  for (let i = 0; i < slots.length; i += 1) {
    if (!isSlotPast(eventDate, slots[i].time, now)) return i;
  }
  return slots.length;
}
