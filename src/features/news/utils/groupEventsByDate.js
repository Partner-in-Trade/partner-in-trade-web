import { normalizeEventDateIso } from './normalizeNewsEvent';

/**
 * Groups events by eventDate, preserving API sort order within each day.
 * @param {Array<{ eventDate?: string, event_date?: unknown }>} events
 * @returns {Array<{ date: string, events: typeof events }>}
 */
export function groupEventsByDate(events) {
  if (!events?.length) return [];

  const groups = [];
  let currentDate = null;
  let currentEvents = [];

  for (const event of events) {
    const date = normalizeEventDateIso(event.eventDate ?? event.event_date);
    if (!date) continue;
    if (date !== currentDate) {
      if (currentDate !== null) {
        groups.push({ date: currentDate, events: currentEvents });
      }
      currentDate = date;
      currentEvents = [{ ...event, eventDate: date }];
    } else {
      currentEvents.push({ ...event, eventDate: date });
    }
  }

  if (currentDate !== null) {
    groups.push({ date: currentDate, events: currentEvents });
  }

  return groups;
}
