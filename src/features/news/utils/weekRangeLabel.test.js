import { describe, it, expect } from 'vitest';
import {
  formatEventDateHeader,
  formatEventTime,
  formatValue,
  getThisWeekRangeLabel,
} from './weekRangeLabel';

describe('weekRangeLabel', () => {
  it('formatEventDateHeader includes weekday and date', () => {
    expect(formatEventDateHeader('2026-10-20')).toMatch(/Tuesday · Oct 20, 2026/);
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
