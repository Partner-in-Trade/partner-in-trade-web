import { describe, it, expect } from 'vitest';
import {
  selectSelectedMarket,
  selectEnrichedTrades,
  selectJournalLoading,
  selectJournalError,
  selectNeedsSubscriptionOnboarding,
  selectOnboardingComplete,
  PRODUCT_CAPABILITIES,
  selectAvailableCapabilities,
  selectHasCapability,
} from './selectors';
describe('selectors', () => {
  const baseState = {
    auth: { user: null, authError: null, authLoading: false },
    workspace: {
      markets: [{ id: 10, name: 'Forex' }, { id: 11, name: 'Stocks' }],
      selectedMarketId: 11,
      strategiesByName: {},
      workspaceLoading: false,
      workspaceError: null,
    },
    trades: {
      rawTrades: [
        { id: '2', date: '2025-05-02', entryTime: '10:00', direction: 'LONG', quantity: 1, entryPrice: 1, exitPrice: 2, stopLoss: 0, fees: 0 },
        { id: '1', date: '2025-05-01', entryTime: '09:00', direction: 'LONG', quantity: 1, entryPrice: 1, exitPrice: 2, stopLoss: 0, fees: 0 },
      ],
      tradesLoading: false,
      tradesError: null,
      isAddModalOpen: false,
      prefillDate: null,
      selectedTrade: null,
    },
    ui: { activeTab: 'dashboard' },
    subscription: {
      me: { planCode: 'FREE' },
      status: 'ready',
    },
  };

  it('selectSelectedMarket finds market by id', () => {
    expect(selectSelectedMarket(baseState)?.name).toBe('Stocks');
  });

  it('selectEnrichedTrades sorts newest date first', () => {
    const trades = selectEnrichedTrades(baseState);
    expect(trades[0].id).toBe('2');
    expect(trades.map((trade) => trade.id)).toEqual(['2', '1']);
  });

  it('gates workspace until plan is not FREE', () => {
    expect(selectNeedsSubscriptionOnboarding(baseState)).toBe(true);
    expect(selectOnboardingComplete(baseState)).toBe(false);
    const trial = {
      ...baseState,
      subscription: { me: { planCode: 'TRIAL' }, status: 'ready' },
    };
    expect(selectNeedsSubscriptionOnboarding(trial)).toBe(false);
    expect(selectOnboardingComplete(trial)).toBe(true);
  });

  it('uses centralized plan capability mapping and backend entitlements', () => {
    const free = baseState;
    expect(selectAvailableCapabilities(free)).toEqual([]);
    expect(selectHasCapability(free, PRODUCT_CAPABILITIES.DASHBOARD)).toBe(false);

    const trial = {
      ...baseState,
      subscription: { me: { planCode: 'TRIAL' }, status: 'ready' },
    };
    expect(selectHasCapability(trial, PRODUCT_CAPABILITIES.NEWS_CALENDAR)).toBe(true);

    const basic = {
      ...baseState,
      subscription: { me: { planCode: 'BASIC' }, status: 'ready' },
    };
    expect(selectHasCapability(basic, PRODUCT_CAPABILITIES.STRATEGIES)).toBe(true);
    expect(selectHasCapability(basic, PRODUCT_CAPABILITIES.PNL_CALENDAR)).toBe(false);

    const backendEntitlements = {
      ...basic,
      subscription: {
        ...basic.subscription,
        entitlements: {
          effectivePlanCode: 'BASIC',
          capabilities: ['DASHBOARD', 'NEWS_CALENDAR'],
        },
      },
    };
    expect(selectHasCapability(backendEntitlements, PRODUCT_CAPABILITIES.NEWS_CALENDAR)).toBe(true);
    expect(selectHasCapability(backendEntitlements, PRODUCT_CAPABILITIES.STRATEGIES)).toBe(false);
  });

  it('selectJournalLoading and selectJournalError combine workspace and trades', () => {
    expect(selectJournalLoading(baseState)).toBe(false);
    expect(selectJournalError(baseState)).toBeNull();

    const loading = {
      ...baseState,
      workspace: { ...baseState.workspace, workspaceLoading: true },
    };
    expect(selectJournalLoading(loading)).toBe(true);

    const err = {
      ...baseState,
      trades: { ...baseState.trades, tradesError: 'fail' },
    };
    expect(selectJournalError(err)).toBe('fail');
  });
});
