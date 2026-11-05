import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tradesApi } from '@/features/trades/api/tradesApi';
import { fetchMarketAnalytics } from './analyticsSlice';
import {
  apiTradeToUi,
  uiTradeToApi,
  resolveStrategyId,
} from '@/lib/mappers/tradeMapper';
import { logout } from './authSlice';

const initialTradesState = {
  rawTrades: [],
  tradesLoading: false,
  tradesError: null,
  isAddModalOpen: false,
  prefillDate: null,
  selectedTrade: null,
};

export const fetchTrades = createAsyncThunk(
  'trades/fetchTrades',
  async (_, { getState, rejectWithValue }) => {
    const { workspace } = getState();
    const market = workspace.markets.find((m) => m.id === workspace.selectedMarketId);
    if (!market?.id) return { trades: [] };
    try {
      const res = await tradesApi.getByMarket(market.id);
      return { trades: (res.data || []).map(apiTradeToUi) };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to load trades');
    }
  }
);

export const addTrade = createAsyncThunk(
  'trades/addTrade',
  async (newTradeData, { getState, dispatch, rejectWithValue }) => {
    const { auth, workspace } = getState();
    const user = auth.user;
    const marketId = newTradeData.marketId ?? workspace.selectedMarketId;
    const market = workspace.markets.find((m) => m.id === marketId);
    if (!user?.id || !market) return rejectWithValue('Account not ready');

    const strategyId = resolveStrategyId(workspace.strategiesByName, newTradeData.setup);
    if (!strategyId) return rejectWithValue('No strategy available for this setup');

    try {
      const payload = uiTradeToApi(newTradeData, {
        userId: Number(user.id),
        marketId: market.id,
        marketName: market.name,
        strategyId,
      });
      const res = await tradesApi.create(payload);
      if (market.id === getState().workspace.selectedMarketId) {
        dispatch(fetchMarketAnalytics(market.id));
      }
      return {
        trade: apiTradeToUi(res.data),
        appendToList: market.id === workspace.selectedMarketId,
      };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to add trade');
    }
  }
);

export const closeTrade = createAsyncThunk(
  'trades/closeTrade',
  async ({ tradeId, exitPrice, closingFees, exitType = 'MANUAL' }, { getState, dispatch, rejectWithValue }) => {
    try {
      const payload = { exitPrice: Number(exitPrice), exitType };
      if (closingFees !== '' && closingFees != null) payload.closingFees = Number(closingFees);
      const response = await tradesApi.close(tradeId, payload);
      const marketId = getState().workspace.selectedMarketId;
      if (marketId != null) dispatch(fetchMarketAnalytics(marketId));
      return { trade: apiTradeToUi(response.data) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to close trade');
    }
  }
);

export const deleteTrade = createAsyncThunk(
  'trades/deleteTrade',
  async (tradeId, { getState, dispatch, rejectWithValue }) => {
    try {
      await tradesApi.delete(tradeId);
      const state = getState();
      const selectedId = state.trades.selectedTrade?.id;
      const marketId = state.workspace.selectedMarketId;
      if (marketId != null) dispatch(fetchMarketAnalytics(marketId));
      return { tradeId, clearSelection: selectedId === tradeId };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to delete trade');
    }
  }
);

const tradesSlice = createSlice({
  name: 'trades',
  initialState: initialTradesState,
  reducers: {
    setIsAddModalOpen(state, action) {
      state.isAddModalOpen = action.payload;
    },
    openAddTradeModal(state, action) {
      state.prefillDate = action.payload ?? null;
      state.isAddModalOpen = true;
    },
    setSelectedTrade(state, action) {
      state.selectedTrade = action.payload;
    },
    resetTrades() {
      return { ...initialTradesState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => ({ ...initialTradesState }))
      .addCase(fetchTrades.pending, (state) => {
        state.tradesLoading = true;
        state.tradesError = null;
      })
      .addCase(fetchTrades.fulfilled, (state, action) => {
        state.tradesLoading = false;
        state.rawTrades = action.payload.trades;
      })
      .addCase(fetchTrades.rejected, (state, action) => {
        state.tradesLoading = false;
        state.tradesError = action.payload || 'Failed to load trades';
        state.rawTrades = [];
      })
      .addCase(closeTrade.fulfilled, (state, action) => {
        const updated = action.payload.trade;
        state.rawTrades = state.rawTrades.map((trade) => trade.id === updated.id ? updated : trade);
      })
      .addCase(addTrade.fulfilled, (state, action) => {
        if (action.payload.appendToList) state.rawTrades = [action.payload.trade, ...state.rawTrades];
      })
      .addCase(deleteTrade.fulfilled, (state, action) => {
        const { tradeId, clearSelection } = action.payload;
        state.rawTrades = state.rawTrades.filter((t) => t.id !== tradeId);
        if (clearSelection) state.selectedTrade = null;
      });
  },
});

export const { setIsAddModalOpen, openAddTradeModal, setSelectedTrade, resetTrades } = tradesSlice.actions;
export { fetchTrades as refreshTrades };
export default tradesSlice.reducer;
