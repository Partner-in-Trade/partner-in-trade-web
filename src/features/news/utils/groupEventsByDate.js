/**
 * Groups events by eventDate, preserving API sort order within each day.
 * @param {Array<{ eventDate: string }>} events
 * @returns {Array<{ date: string, events: typeof events }>}
 */
export function groupEventsByDate(events) {
  if (!events?.length) return [];

  const groups = [];
  let currentDate = null;
  let currentEvents = [];

  for (const event of events) {
    const date = event.eventDate;
    if (date !== currentDate) {
      if (currentDate !== null) {
        groups.push({ date: currentDate, events: currentEvents });
      }
      currentDate = date;
      currentEvents = [event];
    } else {
      currentEvents.push(event);
    }
  }

  if (currentDate !== null) {
    groups.push({ date: currentDate, events: currentEvents });
  }

  return groups;
}
