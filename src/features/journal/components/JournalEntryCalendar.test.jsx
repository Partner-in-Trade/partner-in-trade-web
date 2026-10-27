import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JournalEntryCalendar } from './JournalEntryCalendar';
import { renderWithProviders } from '@/test/renderWithProviders';

const journalState = (overrides = {}) => ({
  summariesByDate: {},
  dailyByDate: {},
  dailyLoading: false,
  dailySaving: false,
  dailyError: null,
  selectedDate: '2025-05-01',
  mainView: 'day',
  journalNavExpanded: true,
  ...overrides,
});

describe('JournalEntryCalendar', () => {
  it('updates selected date and calls onDateSelect when a day is clicked', async () => {
    const user = userEvent.setup();
    const onDateSelect = vi.fn();
    const { store } = renderWithProviders(
      <JournalEntryCalendar compact onDateSelect={onDateSelect} />,
      { preloadedState: { journal: journalState() } }
    );

    await user.click(screen.getByRole('button', { name: '15' }));

    expect(onDateSelect).toHaveBeenCalledWith('2025-05-15');
    expect(store.getState().journal.selectedDate).toBe('2025-05-15');
  });

  it('fetches journal summaries for the visible month', async () => {
    renderWithProviders(<JournalEntryCalendar compact />, {
      preloadedState: { journal: journalState() },
    });

    await waitFor(() => {
      expect(screen.getByText('May 2025')).toBeInTheDocument();
    });
  });
});
