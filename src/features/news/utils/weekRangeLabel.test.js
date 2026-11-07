import { describe, it, expect } from 'vitest';
import {
  formatEventDateHeader,
  formatEventTime,
  formatValue,
  formatNewsMonthDay,
  getThisWeekRangeLabel,
} from './weekRangeLabel';

describe('weekRangeLabel', () => {
  it('formatEventDateHeader uses long weekday and month title', () => {
    expect(formatEventDateHeader('2026-10-20')).toMatch(/Tuesday, October 20/);
  });

  it('formatNewsMonthDay uses long month and day', () => {
    expect(formatNewsMonthDay('2026-11-02')).toBe('November 2');
  });

  it('formatEventTime strips seconds', () => {
    expect(formatEventTime('18:30:00')).toBe('18:30');
    expect(formatEventTime('9:05:00')).toBe('09:05');
  });

  it('formatValue shows em dash for empty values', () => {
    expect(formatValue(null)).toBe('—');
    expect(formatValue('')).toBe('—');
    expect(formatValue('0.3%')).toBe('0.3%');
  });

  it('getThisWeekRangeLabel includes IST suffix', () => {
    const label = getThisWeekRangeLabel(new Date('2026-10-24T12:00:00Z'));
    expect(label).toMatch(/IST$/);
    expect(label).toMatch(/Oct/);
  });
});
