import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestStore } from '@/test/renderWithProviders';
import { fetchMarketAnalytics } from './analyticsSlice';
import * as analyticsApiModule from '@/features/analytics/api/analyticsApi';
import { mockMarkets, mockUser } from '@/test/fixtures';

describe('fetchMarketAnalytics', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function storeWithMarket(selectedMarketId = 10) {
    return createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
      workspace: {
        markets: mockMarkets,
        selectedMarketId,
        strategiesByName: {},
        workspaceLoading: false,
        workspaceError: null,
      },
    });
  }

  it('skips duplicate in-flight request for the same market', async () => {
    const getByMarket = vi.spyOn(analyticsApiModule.analyticsApi, 'getByMarket').mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                data: {
                  marketId: 10,
                  currency: 'USD',
                  totalNetPnl: 0,
                  totalTrades: 0,
                  closedTradesCount: 0,
                  winRate: 0,
                  winsCount: 0,
                  lossesCount: 0,
                  breakevenCount: 0,
                  profitFactor: null,
                  avgWin: 0,
                  avgLoss: 0,
                  expectancy: 0,
                  avgRMultiple: 0,
                  equityCurve: [],
                  dailySeries: [],
                  strategyBreakdown: [],
                },
              }),
            50
          );
        })
    );

    const store = storeWithMarket(10);
    const first = store.dispatch(fetchMarketAnalytics(10));
    const second = store.dispatch(fetchMarketAnalytics(10));

    await Promise.all([first, second]);
    expect(getByMarket).toHaveBeenCalledTimes(1);
  });

  it('skips when marketId does not match workspace selection', async () => {
    const getByMarket = vi.spyOn(analyticsApiModule.analyticsApi, 'getByMarket');

    const store = storeWithMarket(10);
    await store.dispatch(fetchMarketAnalytics(11));

    expect(getByMarket).not.toHaveBeenCalled();
  });
});
