import { describe, it, expect } from 'vitest';
import { groupEventsByDate } from './groupEventsByDate';

describe('groupEventsByDate', () => {
  it('groups consecutive events by date', () => {
    const events = [
      { id: '1', eventDate: '2026-10-20' },
      { id: '2', eventDate: '2026-10-20' },
      { id: '3', eventDate: '2026-10-21' },
    ];
    const groups = groupEventsByDate(events);
    expect(groups).toHaveLength(2);
    expect(groups[0].date).toBe('2026-10-20');
    expect(groups[0].events).toHaveLength(2);
    expect(groups[1].date).toBe('2026-10-21');
  });

  it('returns empty array for no events', () => {
    expect(groupEventsByDate([])).toEqual([]);
  });
});
