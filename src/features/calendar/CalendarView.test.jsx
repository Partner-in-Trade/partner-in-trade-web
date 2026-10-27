import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarView } from './CalendarView';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('CalendarView', () => {
  it('opens journal day view when clicking a day', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<CalendarView />, {
      preloadedState: {
        trades: {
          rawTrades: [],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: false,
          prefillDate: null,
          selectedTrade: null,
        },
        journal: {
          summariesByDate: {},
          dailyByDate: {},
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-05-01',
          mainView: 'day',
          journalNavExpanded: false,
        },
        ui: { activeTab: 'calendar' },
      },
    });
    await user.click(screen.getByText('15'));
    expect(store.getState().journal.mainView).toBe('day');
    expect(store.getState().journal.selectedDate).toMatch(/2025-05-/);
    expect(store.getState().ui.activeTab).toBe('journal');
  });
});
