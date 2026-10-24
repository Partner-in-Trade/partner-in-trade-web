import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarView } from './CalendarView';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('CalendarView', () => {
  it('opens add trade modal when clicking empty day', async () => {
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
      },
    });
    await user.click(screen.getByText('15'));
    expect(store.getState().trades.isAddModalOpen).toBe(true);
    expect(store.getState().trades.prefillDate).toMatch(/2025-05-/);
  });
});
