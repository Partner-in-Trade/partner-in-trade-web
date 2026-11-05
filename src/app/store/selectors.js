import { createSelector } from '@reduxjs/toolkit';

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthError = (state) => state.auth.authError;
export const selectAuthLoading = (state) => state.auth.authLoading;

export const selectMarkets = (state) => state.workspace.markets;
export const selectSelectedMarketId = (state) => state.workspace.selectedMarketId;
export const selectStrategiesByName = (state) => state.workspace.strategiesByName;
export const selectWorkspaceLoading = (state) => state.workspace.workspaceLoading;
export const selectWorkspaceError = (state) => state.workspace.workspaceError;

export const selectRawTrades = (state) => state.trades.rawTrades;
export const selectTradesLoading = (state) => state.trades.tradesLoading;
export const selectTradesError = (state) => state.trades.tradesError;
export const selectIsAddModalOpen = (state) => state.trades.isAddModalOpen;
export const selectPrefillDate = (state) => state.trades.prefillDate;
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
