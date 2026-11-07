const NEWS_TIME_ZONE = 'Asia/Kolkata';

function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Format Mon–Sun range from ISO calendar dates (UTC-safe). */
export function formatWeekRangeLabelFromIso(mondayIso, sundayIso) {
  const monday = new Date(`${mondayIso}T12:00:00Z`);
  const sunday = new Date(`${sundayIso}T12:00:00Z`);
  const monLabel = monday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const sunLabel = sunday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `${monLabel} - ${sunLabel} · IST`;
}

/**
 * Monday–Sunday range label for the current IST calendar week (when no event payload).
 */
export function getThisWeekRangeLabel(referenceDate = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: NEWS_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(referenceDate);

  const y = Number(parts.find((p) => p.type === 'year').value);
  const m = Number(parts.find((p) => p.type === 'month').value) - 1;
  const d = Number(parts.find((p) => p.type === 'day').value);
  const inTz = new Date(Date.UTC(y, m, d));

  const monday = startOfWeekMonday(inTz);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const monLabel = monday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: NEWS_TIME_ZONE,
  });
  const sunLabel = sunday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: NEWS_TIME_ZONE,
  });
  return `${monLabel} - ${sunLabel} · IST`;
}

/** Mock-style day title: "Friday, November 6" */
export function formatNewsDayTitle(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Side-rail day label: "November 2" */
export function formatNewsMonthDay(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatEventDateHeader(dateStr) {
  return formatNewsDayTitle(dateStr);
}

export function formatEventTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  if (h === undefined || m === undefined) return timeStr;
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

export function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  return value;
}
