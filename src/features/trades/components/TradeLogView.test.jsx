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

  it('shows enriched net pnl and r-multiple from analytics', () => {
    renderWithProviders(<TradeLogView />, {
      preloadedState: {
        workspace: {
          markets: [{ id: 10, name: 'FX', currency: 'USD', funds: 1000 }],
          selectedMarketId: 10,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
        trades: {
          rawTrades: [uiTrade],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: false,
          prefillDate: null,
          selectedTrade: null,
        },
        analytics: {
          data: {
            marketId: 10,
            tradePerformance: [
              {
                tradeId: String(uiTrade.id),
                netPnl: 42.5,
                rMultiple: 1.25,
                outcome: 'WIN',
              },
            ],
          },
          loading: false,
          error: null,
          marketId: 10,
        },
      },
    });
    expect(screen.getByText('1.25R')).toBeInTheDocument();
    expect(screen.getByText('$42.50')).toBeInTheDocument();
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
    await user.click(screen.getByRole('button', { name: 'Delete AAPL' }));
    await waitFor(() => {
      expect(store.getState().trades.rawTrades).toHaveLength(0);
    });
  });
});
