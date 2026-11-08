import { createSelector } from '@reduxjs/toolkit';

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthError = (state) => state.auth.authError;
export const selectAuthLoading = (state) => state.auth.authLoading;

export const selectMarkets = (state) => state.workspace.markets;
export const selectSelectedMarketId = (state) => state.workspace.selectedMarketId;
export const selectStrategiesByName = (state) => state.workspace.strategiesByName;
export const selectStrategies = (state) => state.workspace.strategies;
export const selectStrategiesSearch = (state) => state.workspace.strategiesSearch;
export const selectStrategiesLoadedSearch = (state) => state.workspace.strategiesLoadedSearch;
export const selectStrategiesLoading = (state) => state.workspace.strategiesLoading;
export const selectStrategiesError = (state) => state.workspace.strategiesError;

export const selectStrategyNames = createSelector([selectStrategiesByName], (byName) =>
  Object.keys(byName).sort((a, b) => a.localeCompare(b))
);
export const selectWorkspaceLoading = (state) => state.workspace.workspaceLoading;
export const selectWorkspaceError = (state) => state.workspace.workspaceError;

export const selectRawTrades = (state) => state.trades.rawTrades;
export const selectTradesLoading = (state) => state.trades.tradesLoading;
export const selectTradesError = (state) => state.trades.tradesError;
export const selectIsAddModalOpen = (state) => state.trades.isAddModalOpen;
export const selectPrefillDate = (state) => state.trades.prefillDate;
export const selectPrefillSetup = (state) => state.trades.prefillSetup;
export const selectSelectedTrade = (state) => state.trades.selectedTrade;

export const selectAnalytics = (state) => state.analytics?.data ?? null;
export const selectAnalyticsLoading = (state) => state.analytics?.loading ?? false;
export const selectAnalyticsError = (state) => state.analytics?.error ?? null;
export const selectAnalyticsMarketId = (state) => state.analytics?.marketId ?? null;

export const selectSelectedTradeWithPerformance = createSelector(
  [selectSelectedTrade, selectAnalytics],
  (trade, analytics) => {
    if (!trade) return null;
    const performanceById = new Map(
      (analytics?.tradePerformance || []).map((item) => [String(item.tradeId), item])
    );
    const performance = performanceById.get(String(trade.id));
    return {
      ...trade,
      netPnl: performance?.netPnl ?? null,
      rMultiple: performance?.rMultiple ?? null,
      outcome: performance?.outcome ?? (trade.exitPrice === '' ? 'OPEN' : 'UNKNOWN'),
    };
  }
);

export const selectSelectedMarket = (state) =>
  selectMarkets(state).find((market) => market.id === selectSelectedMarketId(state)) ?? null;

export const selectJournalLoading = (state) =>
  selectWorkspaceLoading(state) || selectTradesLoading(state);

export const selectJournalError = (state) =>
  selectWorkspaceError(state) || selectTradesError(state);

export const selectActiveTab = (state) => state.ui.activeTab;

export const selectSubscriptionMe = (state) => state.subscription?.me ?? null;
export const selectSubscriptionPlans = (state) => state.subscription?.plans ?? [];
export const selectSubscriptionStatus = (state) => state.subscription?.status ?? 'idle';
export const selectSubscriptionError = (state) => state.subscription?.error ?? null;
export const selectSubscriptionEntitlements = (state) => state.subscription?.entitlements ?? null;

export const PRODUCT_CAPABILITIES = Object.freeze({
  DASHBOARD: 'DASHBOARD',
  ANALYTICS: 'ANALYTICS',
  PNL_CALENDAR: 'PNL_CALENDAR',
  JOURNAL: 'JOURNAL',
  JOURNAL_MEDIA: 'JOURNAL_MEDIA',
  TRADE_LOG: 'TRADE_LOG',
  STRATEGIES: 'STRATEGIES',
  MARKETS: 'MARKETS',
  NEWS_CALENDAR: 'NEWS_CALENDAR',
});

const PLAN_CAPABILITIES = Object.freeze({
  FREE: [],
  TRIAL: Object.values(PRODUCT_CAPABILITIES),
  BASIC: [
    PRODUCT_CAPABILITIES.DASHBOARD,
    PRODUCT_CAPABILITIES.ANALYTICS,
    PRODUCT_CAPABILITIES.JOURNAL,
    PRODUCT_CAPABILITIES.JOURNAL_MEDIA,
    PRODUCT_CAPABILITIES.TRADE_LOG,
    PRODUCT_CAPABILITIES.STRATEGIES,
    PRODUCT_CAPABILITIES.MARKETS,
  ],
  PRO: Object.values(PRODUCT_CAPABILITIES),
});

export const selectEffectivePlanCode = (state) =>
  selectSubscriptionEntitlements(state)?.effectivePlanCode ??
  selectSubscriptionMe(state)?.effectivePlanCode ??
  selectSubscriptionMe(state)?.planCode ??
  'FREE';

export const selectAvailableCapabilities = (state) => {
  const entitlements = selectSubscriptionEntitlements(state);
  if (Array.isArray(entitlements?.capabilities)) return entitlements.capabilities;
  return PLAN_CAPABILITIES[selectEffectivePlanCode(state)] ?? PLAN_CAPABILITIES.FREE;
};

export const selectHasCapability = (state, capability) =>
  selectAvailableCapabilities(state).includes(capability);
export const selectTrialLoading = (state) => state.subscription?.trialLoading ?? false;
export const selectCheckoutLoading = (state) => state.subscription?.checkoutLoading ?? false;

export const selectSubscriptionBootstrapping = (state) =>
  selectIsAuthenticated(state) && selectSubscriptionStatus(state) === 'loading';

export const selectNeedsSubscriptionOnboarding = (state) =>
  selectSubscriptionStatus(state) === 'ready' &&
  Boolean(selectSubscriptionMe(state)) &&
  selectEffectivePlanCode(state) === 'FREE';

export const selectOnboardingComplete = (state) =>
  selectSubscriptionStatus(state) === 'ready' &&
  Boolean(selectSubscriptionMe(state)) &&
  selectEffectivePlanCode(state) !== 'FREE';

// Sorting is presentation-only; financial metrics remain sourced from the backend.
export const selectEnrichedTrades = createSelector(
  [selectRawTrades, selectAnalytics],
  (trades, analytics) => {
    const performanceById = new Map(
      (analytics?.tradePerformance || []).map((item) => [String(item.tradeId), item])
    );
    return [...trades].map((trade) => {
      const performance = performanceById.get(String(trade.id));
      return {
        ...trade,
        netPnl: performance?.netPnl ?? null,
        rMultiple: performance?.rMultiple ?? null,
        outcome: performance?.outcome ?? (trade.exitPrice === '' ? 'OPEN' : 'UNKNOWN'),
      };
    }).sort((a, b) => {
      const dateOrder = String(b.date ?? '').localeCompare(String(a.date ?? ''));
      if (dateOrder !== 0) return dateOrder;
      return String(b.entryTime ?? '').localeCompare(String(a.entryTime ?? ''));
    });
  }
);
