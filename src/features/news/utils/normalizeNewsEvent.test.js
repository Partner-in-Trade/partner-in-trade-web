import { describe, it, expect } from 'vitest';
import {
  normalizeEventDateIso,
  normalizeEventTime,
  normalizeNewsEvent,
  normalizeNewsEvents,
} from './normalizeNewsEvent';
import { groupEventsByDate } from './groupEventsByDate';

describe('normalizeNewsEvent', () => {
  it('normalizes ISO date strings', () => {
    expect(normalizeEventDateIso('2026-11-06')).toBe('2026-11-06');
    expect(normalizeEventDateIso('2026-11-06T00:00:00')).toBe('2026-11-06');
    expect(normalizeEventDateIso('2026-11-6')).toBe('2026-11-06');
  });

  it('normalizes Jackson-style date arrays', () => {
    expect(normalizeEventDateIso([2026, 11, 6])).toBe('2026-11-06');
  });

  it('normalizes snake_case API fields on events', () => {
    const event = normalizeNewsEvent({
      event_date: '2026-11-06',
      event_time: '14:30:00',
      event_name: 'CPI',
      impact: 'high',
      currency: 'USD',
    });
    expect(event.eventDate).toBe('2026-11-06');
    expect(event.eventTime).toBe('14:30:00');
    expect(event.eventName).toBe('CPI');
    expect(event.impact).toBe('HIGH');
  });

  it('normalizes time arrays and objects', () => {
    expect(normalizeEventTime([14, 30])).toBe('14:30:00');
    expect(normalizeEventTime({ hour: 9, minute: 5, second: 0 })).toBe('09:05:00');
  });

  it('groupEventsByDate matches selected day strings after normalization', () => {
    const raw = [
      { id: '1', event_date: [2026, 11, 6], eventTime: '10:00:00' },
      { id: '2', event_date: [2026, 11, 6], eventTime: '11:00:00' },
    ];
    const normalized = normalizeNewsEvents(raw);
    const grouped = groupEventsByDate(normalized);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].date).toBe('2026-11-06');
    expect(grouped[0].events).toHaveLength(2);
  });
});
