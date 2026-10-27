import { describe, it, expect } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JournalView } from './JournalView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { saveDailyJournal } from '@/app/store/slices/journalSlice';

const formForSave = {
  title: 'Disciplined session',
  quickSummary: '',
  marketOverview: '<p>Overview</p>',
  whatWentWell: '<p>Win</p>',
  whatToImprove: '<p>Fix</p>',
  screenshots: [],
};

describe('journal save flow', () => {
  it('returns to read-only day view after save completes', async () => {
    const { store } = renderWithProviders(<JournalView />, {
      preloadedState: {
        journal: {
          summariesByDate: { '2025-05-15': { journalDate: '2025-05-15', hasEntry: true } },
          dailyByDate: { '2025-05-15': formForSave },
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-05-15',
          mainView: 'write',
          journalNavExpanded: true,
        },
      },
    });

    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument();

    await act(async () => {
      await store.dispatch(
        saveDailyJournal({ date: '2025-05-15', form: formForSave, pendingUploads: {} })
      );
    });

    await waitFor(() => {
      expect(store.getState().journal.mainView).toBe('day');
    });

    expect(screen.getByRole('button', { name: /edit journal entry/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
    expect(screen.getByText('Disciplined session')).toBeInTheDocument();
    expect(screen.getByText(/read-only/i)).toBeInTheDocument();
  });

  it('save button triggers save and lands on read-only view', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<JournalView />, {
      preloadedState: {
        journal: {
          summariesByDate: {},
          dailyByDate: { '2025-05-15': formForSave },
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-05-15',
          mainView: 'write',
          journalNavExpanded: true,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/headline for the day/i)).toHaveValue('Disciplined session');
    });

    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(store.getState().journal.mainView).toBe('day');
      expect(screen.getByRole('button', { name: /edit journal entry/i })).toBeInTheDocument();
    });
  });
});
