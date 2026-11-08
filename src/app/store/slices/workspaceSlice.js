import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { marketsApi } from '@/features/markets/api/marketsApi';
import {
  clearStoredMarketType,
  saveMarketType,
  withMarketTypes,
} from '@/features/markets/marketTypeStore';
import { fetchUserStrategies } from '@/lib/bootstrap/ensureUserWorkspace';
import { logout } from './authSlice';

const SELECTED_MARKET_KEY = 'pit_selected_market_id';

function loadInitialSelectedMarketId() {
  const saved = localStorage.getItem(SELECTED_MARKET_KEY);
  return saved ? Number(saved) : null;
}

const initialWorkspaceState = {
  markets: [],
  selectedMarketId: loadInitialSelectedMarketId(),
  strategies: [],
  strategiesByName: {},
  strategiesSearch: '',
  strategiesLoadedSearch: '',
  strategiesInFlightSearch: null,
  strategiesLatestRequestId: null,
  strategiesLoading: false,
  strategiesError: null,
  workspaceLoading: false,
  workspaceError: null,
};

export const bootstrapWorkspace = createAsyncThunk(
  'workspace/bootstrap',
  async (_, { getState, rejectWithValue }) => {
    const user = getState().auth.user;
    if (!user?.id) return rejectWithValue('Not signed in');
    const userId = Number(user.id);
    try {
      const [marketList, strategyPayload] = await Promise.all([
        marketsApi
          .getMarkets(userId)
          .then((res) => withMarketTypes(res.data || [])),
        fetchUserStrategies(userId),
      ]);
      return {
        marketList,
        strategies: strategyPayload.strategies,
        strategyMap: strategyPayload.strategiesByName,
      };
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || e.message || 'Failed to load account data'
      );
    }
  }
);

export const fetchStrategies = createAsyncThunk(
  'workspace/fetchStrategies',
  async (search, { getState, rejectWithValue }) => {
    const user = getState().auth.user;
    if (!user?.id) return rejectWithValue('Not signed in');
    const searchQuery = typeof search === 'string' ? search.trim() : '';
    try {
      const payload = await fetchUserStrategies(
        Number(user.id),
        searchQuery || undefined
      );
      return { ...payload, searchQuery };
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || e.message || 'Failed to load strategies'
      );
    }
  },
  {
    condition: (search, { getState }) => {
      const q = typeof search === 'string' ? search.trim() : '';
      const { strategiesLoadedSearch, strategiesLoading, strategiesInFlightSearch } =
        getState().workspace;
      if (q === strategiesLoadedSearch) return false;
      if (strategiesLoading && q === strategiesInFlightSearch) {
        return false;
      }
      return true;
    },
  }
);

export const createAndActivateMarket = createAsyncThunk(
  'workspace/createAndActivateMarket',
  async ({ name, type, funds, currency }, { getState, rejectWithValue }) => {
    const user = getState().auth.user;
    if (!user?.id) return rejectWithValue('Not signed in');
    const userId = Number(user.id);
    try {
      const created = await marketsApi.createMarket(name.trim(), userId, type);
      const marketId = created.data.id;
      saveMarketType(marketId, type);
      const activated = await marketsApi.activateMarket(marketId, {
        funds: Number(funds),
        currency,
      });
      const list = withMarketTypes(
        await marketsApi.getMarkets(userId).then((res) => res.data || [])
      );
      return { list, selectedMarketId: activated.data.id };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to create market');
    }
  }
);

export const addFundsToMarket = createAsyncThunk(
  'workspace/addFundsToMarket',
  async ({ marketId, funds }, { getState, rejectWithValue }) => {
    const user = getState().auth.user;
    if (!user?.id) return rejectWithValue('Not signed in');
    try {
      await marketsApi.addFunds(marketId, { funds: Number(funds) });
      const list = withMarketTypes(
        await marketsApi.getMarkets(Number(user.id)).then((res) => res.data || [])
      );
      return { list };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to add funds');
    }
  }
);

export const deleteMarket = createAsyncThunk(
  'workspace/deleteMarket',
  async (marketId, { getState, rejectWithValue }) => {
    const user = getState().auth.user;
    if (!user?.id) return rejectWithValue('Not signed in');
    try {
      await marketsApi.deleteMarket(marketId, Number(user.id));
      clearStoredMarketType(marketId);
      const list = withMarketTypes(
        await marketsApi.getMarkets(Number(user.id)).then((res) => res.data || [])
      );
      return { list, deletedMarketId: Number(marketId) };
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || e.message || 'Failed to delete market'
      );
    }
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: initialWorkspaceState,
  reducers: {
    setSelectedMarketId(state, action) {
      const id = action.payload;
      state.selectedMarketId = id;
      if (id != null) {
        localStorage.setItem(SELECTED_MARKET_KEY, String(id));
      } else {
        localStorage.removeItem(SELECTED_MARKET_KEY);
      }
    },
    resetWorkspace() {
      return {
        ...initialWorkspaceState,
        selectedMarketId: null,
      };
    },
    registerStrategyInWorkspace(state, action) {
      const strategy = action.payload;
      if (!strategy || strategy.id == null) return;
      const { name, id } = strategy;
      if (name) {
        state.strategiesByName[name] = id;
      }
      const idx = state.strategies.findIndex((s) => s.id === id);
      if (idx >= 0) {
        state.strategies[idx] = { ...state.strategies[idx], ...strategy };
      } else {
        state.strategies.push(strategy);
      }
    },
    removeStrategyFromWorkspace(state, action) {
      const strategyId = Number(action.payload);
      const deleted = state.strategies.find((strategy) => Number(strategy.id) === strategyId);
      state.strategies = state.strategies.filter(
        (strategy) => Number(strategy.id) !== strategyId
      );
      if (deleted?.name && Number(state.strategiesByName[deleted.name]) === strategyId) {
        delete state.strategiesByName[deleted.name];
      }
    },
    setStrategiesSearch(state, action) {
      state.strategiesSearch = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => ({
        ...initialWorkspaceState,
        selectedMarketId: null,
      }))
      .addCase(bootstrapWorkspace.pending, (state) => {
        state.workspaceLoading = true;
        state.workspaceError = null;
      })
      .addCase(bootstrapWorkspace.fulfilled, (state, action) => {
        const { marketList, strategies, strategyMap } = action.payload;
        state.workspaceLoading = false;
        state.markets = marketList;
        state.strategies = strategies;
        state.strategiesByName = strategyMap;
        state.strategiesLoadedSearch = '';
        state.strategiesSearch = '';
        state.strategiesInFlightSearch = null;
        state.strategiesLatestRequestId = null;
        state.strategiesError = null;

        if (marketList.length === 0) {
          state.selectedMarketId = null;
          localStorage.removeItem(SELECTED_MARKET_KEY);
        } else {
          const savedRaw = localStorage.getItem(SELECTED_MARKET_KEY);
          const savedId = savedRaw ? Number(savedRaw) : null;
          const stillValid =
            savedId != null && marketList.some((m) => m.id === savedId);
          if (!stillValid) {
            state.selectedMarketId = marketList[0].id;
            localStorage.setItem(SELECTED_MARKET_KEY, String(marketList[0].id));
          }
        }
      })
      .addCase(bootstrapWorkspace.rejected, (state, action) => {
        state.workspaceLoading = false;
        state.workspaceError = action.payload || 'Failed to load account data';
        state.markets = [];
        state.strategies = [];
        state.strategiesByName = {};
        state.strategiesSearch = '';
        state.strategiesLoadedSearch = '';
        state.strategiesInFlightSearch = null;
        state.strategiesLatestRequestId = null;
        state.strategiesError = null;
        state.selectedMarketId = null;
        localStorage.removeItem(SELECTED_MARKET_KEY);
      })
      .addCase(createAndActivateMarket.fulfilled, (state, action) => {
        state.markets = action.payload.list;
        state.selectedMarketId = action.payload.selectedMarketId;
        localStorage.setItem(
          SELECTED_MARKET_KEY,
          String(action.payload.selectedMarketId)
        );
      })
      .addCase(addFundsToMarket.fulfilled, (state, action) => {
        state.markets = action.payload.list;
      })
      .addCase(deleteMarket.fulfilled, (state, action) => {
        state.markets = action.payload.list;
        const deletedId = action.payload.deletedMarketId;
        if (Number(state.selectedMarketId) === Number(deletedId)) {
          const next = action.payload.list[0]?.id ?? null;
          state.selectedMarketId = next;
          if (next != null) {
            localStorage.setItem(SELECTED_MARKET_KEY, String(next));
          } else {
            localStorage.removeItem(SELECTED_MARKET_KEY);
          }
        }
      })
      .addCase(fetchStrategies.pending, (state, action) => {
        const searchQuery =
          typeof action.meta.arg === 'string' ? action.meta.arg.trim() : '';
        state.strategiesLoading = true;
        state.strategiesError = null;
        state.strategiesInFlightSearch = searchQuery;
        state.strategiesLatestRequestId = action.meta.requestId;
      })
      .addCase(fetchStrategies.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.strategiesLatestRequestId) {
          return;
        }
        const { strategies, strategiesByName, searchQuery } = action.payload;
        state.strategiesLoading = false;
        state.strategiesInFlightSearch = null;
        state.strategies = strategies;
        state.strategiesLoadedSearch = searchQuery;
        if (searchQuery === '') {
          state.strategiesByName = strategiesByName;
        }
      })
      .addCase(fetchStrategies.rejected, (state, action) => {
        if (action.meta.requestId !== state.strategiesLatestRequestId) {
          return;
        }
        state.strategiesLoading = false;
        state.strategiesInFlightSearch = null;
        state.strategiesError = action.payload || 'Failed to load strategies';
      });
  },
});

export const {
  setSelectedMarketId,
  resetWorkspace,
  registerStrategyInWorkspace,
  removeStrategyFromWorkspace,
  setStrategiesSearch,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
