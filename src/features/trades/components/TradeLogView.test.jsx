import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { TradeLogView } from './TradeLogView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { apiTradeToUi } from '@/lib/mappers/tradeMapper';
import { mockApiTrade } from '@/test/fixtures';
import { server, API_BASE } from '@/test/msw/server';

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

  it('shows close errors and preserves the open trade and entered values', async () => {
    server.use(
      http.patch(`${API_BASE}/trades/:tradeId/close`, () =>
        HttpResponse.json({ message: 'Exit price is invalid' }, { status: 400 })
      )
    );
    const openTrade = apiTradeToUi({
      ...mockApiTrade,
      id: 101,
      status: 'OPEN',
      exitPrice: null,
      exitDate: null,
    });
    const user = userEvent.setup();
    const { store } = renderWithProviders(<TradeLogView />, {
      preloadedState: {
        workspace: {
          markets: [{ id: 10, name: 'FX', currency: 'USD', funds: 1000 }],
          selectedMarketId: 10,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
        trades: {
          rawTrades: [openTrade],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: false,
          prefillDate: null,
          selectedTrade: null,
        },
      },
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    const exitPriceInput = screen.getByRole('spinbutton', { name: 'Exit price' });
    const closingFeesInput = screen.getByRole('spinbutton', { name: 'Closing fees' });
    await user.type(exitPriceInput, '95');
    await user.clear(closingFeesInput);
    await user.type(closingFeesInput, '2.5');
    await user.click(screen.getByRole('button', { name: 'Confirm close trade' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Exit price is invalid');
    expect(exitPriceInput).toHaveValue(95);
    expect(closingFeesInput).toHaveValue(2.5);
    expect(store.getState().trades.rawTrades[0]).toMatchObject({
      id: 101,
      status: 'OPEN',
      exitPrice: '',
    });
    expect(screen.getByRole('button', { name: 'Confirm close trade' })).toBeInTheDocument();
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
