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

export const selectAnalytics = (state) => state.analytics.data;
export const selectAnalyticsLoading = (state) => state.analytics.loading;
export const selectAnalyticsError = (state) => state.analytics.error;
export const selectAnalyticsMarketId = (state) => state.analytics.marketId;

export const selectSelectedMarket = (state) =>
  selectMarkets(state).find((market) => market.id === selectSelectedMarketId(state)) ?? null;

export const selectJournalLoading = (state) =>
  selectWorkspaceLoading(state) || selectTradesLoading(state);

export const selectJournalError = (state) =>
  selectWorkspaceError(state) || selectTradesError(state);

export const selectActiveTab = (state) => state.ui.activeTab;
