function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * @param {unknown} raw
 * @returns {string | null} YYYY-MM-DD
 */
export function normalizeEventDateIso(raw) {
  if (raw == null) return null;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    const isoPrefix = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoPrefix) {
      return `${isoPrefix[1]}-${pad2(isoPrefix[2])}-${pad2(isoPrefix[3])}`;
    }
    return null;
  }

  if (Array.isArray(raw) && raw.length >= 3) {
    const [y, m, d] = raw;
    return `${y}-${pad2(m)}-${pad2(d)}`;
  }

  if (typeof raw === 'object') {
    const obj = /** @type {{ year?: number; month?: number; day?: number }} */ (raw);
    if (obj.year != null && obj.month != null && obj.day != null) {
      return `${obj.year}-${pad2(obj.month)}-${pad2(obj.day)}`;
    }
  }

  return null;
}

/**
 * @param {unknown} raw
 * @returns {string | null} HH:mm:ss
 */
export function normalizeEventTime(raw) {
  if (raw == null) return null;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      return `${pad2(match[1])}:${pad2(match[2])}:${pad2(match[3] ?? '0')}`;
    }
    return trimmed;
  }

  if (Array.isArray(raw) && raw.length >= 2) {
    const [h, m, s = 0] = raw;
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }

  if (typeof raw === 'object') {
    const obj = /** @type {{ hour?: number; minute?: number; second?: number }} */ (raw);
    if (obj.hour != null) {
      return `${pad2(obj.hour)}:${pad2(obj.minute ?? 0)}:${pad2(obj.second ?? 0)}`;
    }
  }

  return null;
}

/**
 * @param {Record<string, unknown>} event
 */
export function normalizeNewsEvent(event) {
  if (!event || typeof event !== 'object') return event;

  const eventDate = normalizeEventDateIso(event.eventDate ?? event.event_date);
  const eventTime = normalizeEventTime(event.eventTime ?? event.event_time);
  const impactRaw = event.impact;
  const impact =
    typeof impactRaw === 'string' ? impactRaw.toUpperCase().replace(/\s+/g, '_') : impactRaw;

  return {
    ...event,
    eventDate,
    eventTime,
    impact,
    eventName: event.eventName ?? event.event_name ?? event.title,
    eventUid: event.eventUid ?? event.event_uid,
  };
}

/**
 * @param {unknown} payload
 * @returns {Array<ReturnType<typeof normalizeNewsEvent>>}
 */
export function normalizeNewsEvents(payload) {
  const list = coerceEventsList(payload);
  return list.map((event) => normalizeNewsEvent(event)).filter((e) => e.eventDate);
}

function coerceEventsList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = /** @type {Record<string, unknown>} */ (data);
    if (Array.isArray(obj.events)) return obj.events;
    if (Array.isArray(obj.content)) return obj.content;
  }
  return [];
}
