import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JournalView } from '@/features/journal/JournalView';
import { JournalSidebarPanel } from './JournalSidebarPanel';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('JournalSidebarPanel', () => {
  it('opens day view when a calendar day is selected', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<JournalSidebarPanel />, {
      preloadedState: {
        journal: {
          summariesByDate: {},
          dailyByDate: {},
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-05-01',
          mainView: 'write',
          journalNavExpanded: true,
        },
      },
    });

    await user.click(screen.getByRole('button', { name: '20' }));

    expect(store.getState().journal.mainView).toBe('day');
    expect(store.getState().journal.selectedDate).toBe('2025-05-20');
  });

  it('opens write view from Write journal', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<JournalSidebarPanel />, {
      preloadedState: {
        journal: {
          summariesByDate: {},
          dailyByDate: {},
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-05-10',
          mainView: 'day',
          journalNavExpanded: true,
        },
      },
    });

    await user.click(screen.getByRole('button', { name: /write journal/i }));
    expect(store.getState().journal.mainView).toBe('write');
    expect(store.getState().journal.selectedDate).toBe('2025-05-10');
  });

  it('shows empty day state in main area when selecting a day without an entry', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <JournalSidebarPanel />
        <JournalView />
      </>,
      {
        preloadedState: {
          journal: {
            summariesByDate: {},
            dailyByDate: {},
            dailyLoading: false,
            dailySaving: false,
            dailyError: null,
            selectedDate: '2025-05-01',
            mainView: 'day',
            journalNavExpanded: true,
          },
        },
      }
    );

    await user.click(screen.getByRole('button', { name: '3' }));
    await waitFor(() => {
      expect(screen.getByText('No entry for this day')).toBeInTheDocument();
    });
  });
});
