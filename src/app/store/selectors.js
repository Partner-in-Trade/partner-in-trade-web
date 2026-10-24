import { createSelector } from '@reduxjs/toolkit';
import { enrichTrade, computePortfolioMetrics } from '@/features/trades/utils/tradeCalculations';

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthError = (state) => state.auth.authError;
export const selectAuthLoading = (state) => state.auth.authLoading;

export const selectMarkets = (state) => state.workspace.markets;
export const selectSelectedMarketId = (state) => state.workspace.selectedMarketId;
export const selectStrategiesByName = (state) => state.workspace.strategiesByName;
export const selectWorkspaceLoading = (state) => state.workspace.workspaceLoading;
export const selectWorkspaceError = (state) => state.workspace.workspaceError;

export const selectSelectedMarket = createSelector(
  [selectMarkets, selectSelectedMarketId],
  (markets, selectedMarketId) => markets.find((m) => m.id === selectedMarketId) ?? null
);

export const selectRawTrades = (state) => state.trades.rawTrades;
export const selectTradesLoading = (state) => state.trades.tradesLoading;
export const selectTradesError = (state) => state.trades.tradesError;
export const selectIsAddModalOpen = (state) => state.trades.isAddModalOpen;
export const selectPrefillDate = (state) => state.trades.prefillDate;
export const selectSelectedTrade = (state) => state.trades.selectedTrade;

export const selectEnrichedTrades = createSelector([selectRawTrades], (rawTrades) =>
  rawTrades
    .map(enrichTrade)
    .sort((a, b) => `${b.date} ${b.entryTime}`.localeCompare(`${a.date} ${a.entryTime}`))
);

export const selectMetrics = createSelector([selectEnrichedTrades], (trades) =>
  computePortfolioMetrics(trades)
);

export const selectJournalLoading = (state) =>
  selectWorkspaceLoading(state) || selectTradesLoading(state);

export const selectJournalError = (state) =>
  selectWorkspaceError(state) || selectTradesError(state);

export const selectActiveTab = (state) => state.ui.activeTab;
