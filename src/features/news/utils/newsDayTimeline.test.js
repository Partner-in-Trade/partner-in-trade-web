import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildJournalPrompt,
  buildWeekDayRows,
  compareActualToForecast,
  filterEventsByImpact,
  formatCountdown,
  getEventInstantInNewsTz,
  getNowMarkerInsertIndex,
  getTodayIsoInNewsTz,
  getWeekBoundsFromEvents,
  groupEventsByTimeSlot,
  isSlotPast,
  resolveSelectedNewsDay,
  summarizeDay,
  summarizeImpactMix,
} from './newsDayTimeline';

describe('newsDayTimeline', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('getTodayIsoInNewsTz uses Asia/Kolkata', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-06T00:30:00Z'));
    expect(getTodayIsoInNewsTz()).toBe('2026-11-06');
  });

  it('groupEventsByTimeSlot clusters same eventTime', () => {
    const events = [
      { id: '1', eventTime: '19:00:00', impact: 'HIGH' },
      { id: '2', eventTime: '19:00:00', impact: 'HIGH' },
      { id: '3', eventTime: '20:30:00', impact: 'MEDIUM' },
    ];
    const slots = groupEventsByTimeSlot(events);
    expect(slots).toHaveLength(2);
    expect(slots[0].isCluster).toBe(true);
    expect(slots[0].events).toHaveLength(2);
    expect(slots[1].isCluster).toBe(false);
  });

  it('filterEventsByImpact filters by impact level', () => {
    const events = [
      { impact: 'HIGH' },
      { impact: 'LOW' },
      { impact: 'MEDIUM' },
    ];
    expect(filterEventsByImpact(events, 'HIGH')).toHaveLength(1);
    expect(filterEventsByImpact(events, 'ALL')).toHaveLength(3);
  });

  it('isSlotPast and formatCountdown respect IST instants', () => {
    const date = '2026-11-06';
    const now = getEventInstantInNewsTz(date, '11:00:00');
    expect(isSlotPast(date, '10:00:00', now)).toBe(true);
    expect(isSlotPast(date, '12:00:00', now)).toBe(false);
    expect(formatCountdown(date, '13:30:00', now)).toBe('IN 2H 30M');
  });

  it('summarizeDay counts upcoming events', () => {
    const date = '2026-11-06';
    const now = getEventInstantInNewsTz(date, '12:00:00');
    const events = [
      { eventTime: '10:00:00', impact: 'HIGH' },
      { eventTime: '14:00:00', impact: 'MEDIUM' },
      { eventTime: '18:00:00', impact: 'LOW' },
    ];
    const summary = summarizeDay(events, date, now);
    expect(summary.total).toBe(3);
    expect(summary.highImpact).toBe(1);
    expect(summary.upcoming).toBe(2);
  });

  it('summarizeImpactMix aggregates impact levels', () => {
    const mix = summarizeImpactMix([
      { impact: 'HIGH' },
      { impact: 'HIGH' },
      { impact: 'MEDIUM' },
      { impact: 'LOW' },
    ]);
    expect(mix).toEqual({ high: 2, medium: 1, low: 1 });
  });

  it('buildJournalPrompt mentions clustered high-impact time', () => {
    const date = '2026-11-06';
    const events = [
      { eventTime: '19:00:00', impact: 'HIGH', eventName: 'NFP' },
      { eventTime: '19:00:00', impact: 'HIGH', eventName: 'UER' },
    ];
    const prompt = buildJournalPrompt(events, date);
    expect(prompt.body).toMatch(/19:00/);
    expect(prompt.body).toMatch(/high-impact/i);
  });

  it('getWeekBoundsFromEvents spans Mon–Sun weeks covered by payload', () => {
    const bounds = getWeekBoundsFromEvents([
      { eventDate: '2026-10-26' },
      { eventDate: '2026-10-31' },
    ]);
    expect(bounds.monday).toBe('2026-10-26');
    expect(bounds.sunday).toBe('2026-11-01');
  });

  it('buildWeekDayRows maps Oct 26–31 API week when today is later', () => {
    const events = [
      { eventDate: '2026-10-26' },
      { eventDate: '2026-10-26' },
      { eventDate: '2026-10-27' },
      { eventDate: '2026-10-31' },
    ];
    const rows = buildWeekDayRows(events, '2026-10-26', '2026-11-06');
    expect(rows.find((r) => r.date === '2026-10-26')?.count).toBe(2);
    expect(rows.find((r) => r.date === '2026-10-26')?.subtitle).toBe('2 events · done');
    expect(rows.find((r) => r.date === '2026-10-31')?.count).toBe(1);
    expect(rows.some((r) => r.date === '2026-11-02')).toBe(false);
  });

  it('resolveSelectedNewsDay picks first event day when today is outside payload', () => {
    const events = [{ eventDate: '2026-10-28' }, { eventDate: '2026-10-29' }];
    expect(resolveSelectedNewsDay(events, '2026-11-06', '2026-11-06')).toBe('2026-10-28');
    expect(resolveSelectedNewsDay(events, '2026-11-06', '2026-10-29')).toBe('2026-10-29');
  });

  it('buildWeekDayRows maps event counts onto calendar days', () => {
    const events = [
      { eventDate: '2026-11-03', eventTime: '10:00:00' },
      { eventDate: '2026-11-03', eventTime: '12:00:00' },
      { eventDate: '2026-11-06', eventTime: '10:00:00' },
      { eventDate: '2026-11-07', eventTime: '10:00:00' },
    ];
    const rows = buildWeekDayRows(events, '2026-11-06', '2026-11-06');
    expect(rows).toHaveLength(7);
    expect(rows.find((r) => r.date === '2026-11-03')?.count).toBe(2);
    expect(rows.find((r) => r.date === '2026-11-03')?.subtitle).toBe('2 events · done');
    expect(rows.find((r) => r.date === '2026-11-06')?.count).toBe(1);
    expect(rows.find((r) => r.date === '2026-11-06')?.isToday).toBe(true);
  });

  it('buildWeekDayRows lists Mon–Sun for the week', () => {
    const events = [
      { eventDate: '2026-11-06', eventTime: '10:00:00' },
      { eventDate: '2026-11-07', eventTime: '10:00:00' },
    ];
    const rows = buildWeekDayRows(events, '2026-11-06', '2026-11-06');
    expect(rows).toHaveLength(7);
    expect(rows.find((r) => r.date === '2026-11-06')?.isToday).toBe(true);
    expect(rows.find((r) => r.date === '2026-11-06')?.isSelected).toBe(true);
    expect(rows.find((r) => r.date === '2026-11-06')?.label).toBe('FRI');
  });

  it('compareActualToForecast returns direction', () => {
    expect(compareActualToForecast('0.4%', '0.3%')).toBe('up');
    expect(compareActualToForecast('1.0%', '1.2%')).toBe('down');
    expect(compareActualToForecast('—', '0.3%')).toBe(null);
  });

  it('getNowMarkerInsertIndex finds first upcoming slot', () => {
    const date = '2026-11-06';
    const now = getEventInstantInNewsTz(date, '12:00:00');
    const slots = groupEventsByTimeSlot([
      { eventTime: '10:00:00' },
      { eventTime: '14:00:00' },
      { eventTime: '18:00:00' },
    ]);
    expect(getNowMarkerInsertIndex(slots, date, now)).toBe(1);
  });
});
