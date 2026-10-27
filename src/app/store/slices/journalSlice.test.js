import { describe, it, expect } from 'vitest';
import journalReducer, {
  fetchJournalByDate,
  openJournalDayView,
  openWriteJournal,
  saveDailyJournal,
} from './journalSlice';

const baseState = {
  summariesByDate: {},
  dailyByDate: {},
  dailyLoading: false,
  dailySaving: false,
  dailyError: null,
  selectedDate: '2025-05-01',
  mainView: 'day',
  journalNavExpanded: false,
};

describe('journalSlice day view', () => {
  it('openJournalDayView sets date and mainView day', () => {
    const state = journalReducer(baseState, openJournalDayView('2025-06-10'));
    expect(state.mainView).toBe('day');
    expect(state.selectedDate).toBe('2025-06-10');
    expect(state.journalNavExpanded).toBe(true);
  });

  it('openWriteJournal switches to write mode', () => {
    const state = journalReducer(baseState, openWriteJournal('2025-06-10'));
    expect(state.mainView).toBe('write');
    expect(state.selectedDate).toBe('2025-06-10');
  });

  it('fetchJournalByDate.fulfilled marks hasEntry from content', () => {
    const state = journalReducer(
      baseState,
      fetchJournalByDate.fulfilled(
        {
          date: '2025-05-15',
          journal: {
            title: 'Logged',
            marketOverview: '<p>x</p>',
            screenshotsJson: [],
          },
        },
        'request-id',
        '2025-05-15'
      )
    );
    expect(state.summariesByDate['2025-05-15'].hasEntry).toBe(true);
    expect(state.dailyByDate['2025-05-15'].title).toBe('Logged');
  });

  it('fetchJournalByDate.fulfilled with no journal clears hasEntry', () => {
    const state = journalReducer(
      {
        ...baseState,
        summariesByDate: { '2025-05-01': { journalDate: '2025-05-01', hasEntry: true } },
      },
      fetchJournalByDate.fulfilled({ date: '2025-05-01', journal: null }, 'request-id', '2025-05-01')
    );
    expect(state.summariesByDate['2025-05-01'].hasEntry).toBe(false);
  });

  it('saveDailyJournal.fulfilled returns to day view', () => {
    const state = journalReducer(
      { ...baseState, mainView: 'write' },
      saveDailyJournal.fulfilled(
        {
          date: '2025-05-15',
          journal: { title: 'Saved', marketOverview: '<p>a</p>', screenshotsJson: [] },
        },
        'request-id',
        { date: '2025-05-15', form: {} }
      )
    );
    expect(state.mainView).toBe('day');
    expect(state.summariesByDate['2025-05-15'].hasEntry).toBe(true);
  });
});
