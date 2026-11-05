import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';
import { createTestStore } from '@/test/renderWithProviders';
import {
  fetchTrades,
  addTrade,
  deleteTrade,
  closeTrade,
  openAddTradeModal,
  setSelectedTrade,
} from './tradesSlice';
import { apiTradeToUi } from '@/lib/mappers/tradeMapper';
import { logout } from './authSlice';
import { mockUser, mockMarkets, mockUiTrade, mockApiTrade } from '@/test/fixtures';

describe('tradesSlice', () => {
  function storeWithMarket() {
    return createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
      workspace: {
        markets: mockMarkets,
        selectedMarketId: 10,
        strategiesByName: { 'VWAP Bounce': 5 },
        workspaceLoading: false,
        workspaceError: null,
      },
    });
  }

  it('fetchTrades loads trades for selected market', async () => {
    const store = storeWithMarket();
    await store.dispatch(fetchTrades());
    expect(store.getState().trades.rawTrades).toHaveLength(1);
    expect(store.getState().trades.rawTrades[0].symbol).toBe('AAPL');
  });

  it('fetchTrades clears when no market selected', async () => {
    const store = createTestStore({
      workspace: {
        markets: [],
        selectedMarketId: null,
        strategiesByName: {},
        workspaceLoading: false,
        workspaceError: null,
      },
    });
    await store.dispatch(fetchTrades());
    expect(store.getState().trades.rawTrades).toEqual([]);
  });

  it('addTrade prepends new trade', async () => {
    const store = storeWithMarket();
    await store.dispatch(addTrade({ ...mockUiTrade, symbol: 'TSLA' }));
    expect(store.getState().trades.rawTrades[0].symbol).toBe('TSLA');
  });

  it('closeTrade updates trade and refreshes analytics', async () => {
    const openTrade = apiTradeToUi({
      ...mockApiTrade,
      id: 'open-trade-1',
      status: 'OPEN',
      exitPrice: null,
      exitDate: null,
    });
    const store = createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
      workspace: {
        markets: mockMarkets,
        selectedMarketId: 10,
        strategiesByName: { 'VWAP Bounce': 5 },
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
    });
    await store.dispatch(closeTrade({ tradeId: 'open-trade-1', exitPrice: 105, closingFees: 1 }));
    const updated = store.getState().trades.rawTrades.find((t) => t.id === 'open-trade-1');
    expect(updated?.status).toBe('CLOSED');
    expect(updated?.exitPrice).toBe(105);
    await waitFor(() => {
      expect(store.getState().analytics.data?.marketId).toBe(10);
    });
  });

  it('deleteTrade removes trade and clears selection when needed', async () => {
    const store = storeWithMarket();
    await store.dispatch(fetchTrades());
    const id = store.getState().trades.rawTrades[0].id;
    store.dispatch(setSelectedTrade({ id }));
    await store.dispatch(deleteTrade(id));
    expect(store.getState().trades.rawTrades).toHaveLength(0);
    expect(store.getState().trades.selectedTrade).toBeNull();
  });

  it('openAddTradeModal sets prefill and opens modal', () => {
    const store = createTestStore();
    store.dispatch(openAddTradeModal('2025-06-01'));
    expect(store.getState().trades.isAddModalOpen).toBe(true);
    expect(store.getState().trades.prefillDate).toBe('2025-06-01');
  });

  it('logout resets trades slice', () => {
    const store = createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
      trades: {
        rawTrades: [{ id: '1' }],
        tradesLoading: true,
        tradesError: 'e',
        isAddModalOpen: true,
        prefillDate: 'x',
        selectedTrade: { id: '1' },
      },
    });
    store.dispatch(logout());
    const t = store.getState().trades;
    expect(t.rawTrades).toEqual([]);
    expect(t.isAddModalOpen).toBe(false);
  });
});
