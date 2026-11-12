import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TradeEntryModal } from './TradeEntryModal';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser, mockMarkets } from '@/test/fixtures';

describe('TradeEntryModal', () => {
  it('renders nothing when modal closed', () => {
    renderWithProviders(<TradeEntryModal />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens with prefill date', () => {
    renderWithProviders(<TradeEntryModal />, {
      preloadedState: {
        trades: {
          rawTrades: [],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: true,
          prefillDate: '2025-06-15',
          selectedTrade: null,
        },
      },
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('submits trade and closes modal', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<TradeEntryModal />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
        workspace: {
          markets: mockMarkets,
          selectedMarketId: 10,
          strategiesByName: { 'Opening Range Breakout (ORB)': 5 },
          workspaceLoading: false,
          workspaceError: null,
        },
        trades: {
          rawTrades: [],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: true,
          prefillDate: null,
          selectedTrade: null,
        },
      },
    });
    await user.type(screen.getByPlaceholderText('EURUSD'), 'EURUSD');
    const prices = screen.getAllByPlaceholderText('0.00');
    await user.type(prices[0], '100');
    await user.type(prices[1], '110');
    await user.click(screen.getByRole('button', { name: /Save trade/i }));
    await waitFor(() => {
      expect(store.getState().trades.isAddModalOpen).toBe(false);
    });
    expect(store.getState().trades.rawTrades.length).toBeGreaterThan(0);
  });
  it('locks currency to the selected market and updates it when the market changes', async () => {
    const user = userEvent.setup();
    const markets = mockMarkets.map((market) => (
      market.id === 11 ? { ...market, currency: 'INR' } : market
    ));
    renderWithProviders(<TradeEntryModal />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
        workspace: {
          markets,
          selectedMarketId: 10,
          strategiesByName: { 'Opening Range Breakout (ORB)': 5 },
          workspaceLoading: false,
          workspaceError: null,
        },
        trades: {
          rawTrades: [],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: true,
          prefillDate: null,
          selectedTrade: null,
        },
      },
    });

    expect(screen.getByLabelText('Market currency')).toHaveTextContent('USD');
    expect(screen.queryByRole('button', { name: 'USD' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'INR' })).not.toBeInTheDocument();

    await user.selectOptions(screen.getAllByRole('combobox')[0], '11');
    expect(screen.getByLabelText('Market currency')).toHaveTextContent('INR');
  });

});
