import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TradeLogView } from './TradeLogView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { apiTradeToUi } from '@/lib/mappers/tradeMapper';
import { mockApiTrade } from '@/test/fixtures';

describe('TradeLogView', () => {
  const uiTrade = apiTradeToUi(mockApiTrade);

  it('lists trades from store', () => {
    renderWithProviders(<TradeLogView />, {
      preloadedState: {
        trades: {
          rawTrades: [uiTrade],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: false,
          prefillDate: null,
          selectedTrade: null,
        },
      },
    });
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('delete removes trade from store', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<TradeLogView />, {
      preloadedState: {
        trades: {
          rawTrades: [uiTrade],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: false,
          prefillDate: null,
          selectedTrade: null,
        },
      },
    });
    const row = screen.getByText('AAPL').closest('tr');
    await user.click(row.querySelector('button'));
    await waitFor(() => {
      expect(store.getState().trades.rawTrades).toHaveLength(0);
    });
  });
});
