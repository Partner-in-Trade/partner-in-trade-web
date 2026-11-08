import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { AppEffects } from './AppEffects';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser, mockMarkets, mockSubscriptionMe } from '@/test/fixtures';
import { AUTH_STORAGE_KEY } from '@/lib/mappers/authMapper';
import * as apiClient from '@/lib/apiClient';
import * as analyticsApiModule from '@/features/analytics/api/analyticsApi';
import { setSelectedMarketId } from '@/app/store';

describe('AppEffects', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    apiClient.setOnUnauthorized(null);
  });

  const subscriptionReady = {
    me: mockSubscriptionMe({ planCode: 'TRIAL', effectivePlanCode: 'TRIAL', onboardingCompleted: true }),
    plans: [],
    status: 'ready',
    trialLoading: false,
    checkoutLoading: false,
    error: null,
  };

  it('loads subscription context when user is present', async () => {
    const { store } = renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
      },
    });
    await waitFor(() => {
      expect(store.getState().subscription.status).toBe('ready');
    });
  });

  it('bootstraps workspace when user is present', async () => {
    const { store } = renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
        subscription: subscriptionReady,
      },
    });
    await waitFor(() => {
      expect(store.getState().workspace.markets.length).toBeGreaterThan(0);
    });
  });

  it('fetches trades after workspace bootstrap', async () => {
    const { store } = renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
        subscription: subscriptionReady,
      },
    });
    await waitFor(() => {
      expect(store.getState().trades.rawTrades.length).toBeGreaterThan(0);
    });
  });

  it('persists user to localStorage', async () => {
    renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
      },
    });
    await waitFor(() => {
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain(mockUser.email);
    });
  });

  it('registers unauthorized handler that logs out', async () => {
    let unauthorizedHandler;
    vi.spyOn(apiClient, 'setOnUnauthorized').mockImplementation((handler) => {
      unauthorizedHandler = handler;
    });

    const { store } = renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
      },
    });

    await waitFor(() => expect(unauthorizedHandler).toBeTypeOf('function'));
    unauthorizedHandler();
    expect(store.getState().auth.user).toBeNull();
  });

  it('fetches analytics once when selected market changes', async () => {
    const getByMarket = vi.spyOn(analyticsApiModule.analyticsApi, 'getByMarket');

    const { store } = renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
        subscription: subscriptionReady,
        workspace: {
          markets: mockMarkets,
          selectedMarketId: 10,
          strategiesByName: { 'VWAP Bounce': 5 },
          workspaceLoading: false,
          workspaceError: null,
        },
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

    await waitFor(() => {
      expect(store.getState().analytics.data?.marketId).toBe(10);
    });

    getByMarket.mockClear();
    store.dispatch(setSelectedMarketId(11));

    await waitFor(() => {
      expect(store.getState().analytics.data?.marketId).toBe(11);
    });

    expect(getByMarket).toHaveBeenCalledTimes(1);
    expect(getByMarket).toHaveBeenCalledWith(11);
  });
});
