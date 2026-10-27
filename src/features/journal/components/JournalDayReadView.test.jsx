import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JournalDayReadView } from './JournalDayReadView';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('JournalDayReadView', () => {
  it('shows empty state when no entry exists for the day', async () => {
    renderWithProviders(<JournalDayReadView />, {
      preloadedState: {
        journal: {
          summariesByDate: {},
          dailyByDate: {},
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-01-10',
          mainView: 'day',
          journalNavExpanded: true,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('No entry for this day')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /add entry for this day/i })).toBeInTheDocument();
  });

  it('opens write mode from Add Entry', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<JournalDayReadView />, {
      preloadedState: {
        journal: {
          summariesByDate: {},
          dailyByDate: {},
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-01-10',
          mainView: 'day',
          journalNavExpanded: true,
        },
      },
    });

    await waitFor(() => screen.getByText('No entry for this day'));
    await user.click(screen.getByRole('button', { name: /add entry for this day/i }));
    expect(store.getState().journal.mainView).toBe('write');
    expect(store.getState().journal.selectedDate).toBe('2025-01-10');
  });

  it('shows read-only entry and Edit FAB when journal exists', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<JournalDayReadView />, {
      preloadedState: {
        journal: {
          summariesByDate: { '2025-05-15': { journalDate: '2025-05-15', hasEntry: true } },
          dailyByDate: {},
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-05-15',
          mainView: 'day',
          journalNavExpanded: true,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Disciplined session')).toBeInTheDocument();
    });
    expect(screen.getByText(/read-only/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /edit journal entry/i }));
    expect(store.getState().journal.mainView).toBe('write');
    expect(store.getState().journal.selectedDate).toBe('2025-05-15');
  });
});
