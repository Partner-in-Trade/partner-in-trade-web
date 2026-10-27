import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '@/test/renderWithProviders';
import {
  bootstrapWorkspace,
  setSelectedMarketId,
  createAndActivateMarket,
  addFundsToMarket,
} from './workspaceSlice';
import { logout } from './authSlice';
import { mockUser, mockMarkets } from '@/test/fixtures';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_BASE } from '@/test/msw/handlers';

describe('workspaceSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function storeWithUser() {
    return createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
    });
  }

  it('bootstrapWorkspace loads markets and strategies', async () => {
    const store = storeWithUser();
    await store.dispatch(bootstrapWorkspace());
    const ws = store.getState().workspace;
    expect(ws.markets).toHaveLength(mockMarkets.length);
    expect(ws.strategiesByName['VWAP Bounce']).toBe(5);
    expect(ws.workspaceLoading).toBe(false);
    expect(ws.selectedMarketId).toBeTruthy();
  });

  it('bootstrapWorkspace failure clears workspace', async () => {
    server.use(
      http.get(`${API_BASE}/markets`, () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    );
    const store = storeWithUser();
    await store.dispatch(bootstrapWorkspace());
    const ws = store.getState().workspace;
    expect(ws.markets).toEqual([]);
    expect(ws.workspaceError).toBeTruthy();
    expect(ws.selectedMarketId).toBeNull();
  });

  it('setSelectedMarketId persists to localStorage', () => {
    const store = createTestStore();
    store.dispatch(setSelectedMarketId(11));
    expect(store.getState().workspace.selectedMarketId).toBe(11);
    expect(localStorage.getItem('pit_selected_market_id')).toBe('11');
    store.dispatch(setSelectedMarketId(null));
    expect(localStorage.getItem('pit_selected_market_id')).toBeNull();
  });

  it('createAndActivateMarket updates markets and selection', async () => {
    const store = storeWithUser();
    await store.dispatch(
      createAndActivateMarket({
        name: 'My coins',
        type: 'Crypto',
        funds: 1000,
        currency: 'USD',
      })
    );
    expect(store.getState().workspace.selectedMarketId).toBe(99);
    expect(store.getState().workspace.markets.length).toBeGreaterThan(0);
  });

  it('addFundsToMarket refreshes market list', async () => {
    const store = storeWithUser();
    await store.dispatch(addFundsToMarket({ marketId: 10, funds: 500 }));
    expect(store.getState().workspace.markets).toHaveLength(mockMarkets.length);
  });

  it('logout resets workspace slice', () => {
    const store = createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
      workspace: {
        markets: mockMarkets,
        selectedMarketId: 10,
        strategiesByName: { a: 1 },
        workspaceLoading: false,
        workspaceError: null,
      },
    });
    store.dispatch(logout());
    expect(store.getState().workspace.markets).toEqual([]);
  });
});
