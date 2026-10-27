import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { marketsApi } from '@/features/markets/api/marketsApi';
import {
  clearStoredMarketType,
  saveMarketType,
  withMarketTypes,
} from '@/features/markets/marketTypeStore';
import { ensureStrategies } from '@/lib/bootstrap/ensureUserWorkspace';
import { logout } from './authSlice';

const SELECTED_MARKET_KEY = 'pit_selected_market_id';

function loadInitialSelectedMarketId() {
  const saved = localStorage.getItem(SELECTED_MARKET_KEY);
  return saved ? Number(saved) : null;
}

const initialWorkspaceState = {
  markets: [],
  selectedMarketId: loadInitialSelectedMarketId(),
  strategiesByName: {},
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
      const [marketList, strategyMap] = await Promise.all([
        marketsApi
          .getMarkets(userId)
          .then((res) => withMarketTypes(res.data || [])),
        ensureStrategies(userId),
      ]);
      return { marketList, strategyMap };
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || e.message || 'Failed to load account data'
      );
    }
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
        const { marketList, strategyMap } = action.payload;
        state.workspaceLoading = false;
        state.markets = marketList;
        state.strategiesByName = strategyMap;

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
        state.strategiesByName = {};
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
      });
  },
});

export const { setSelectedMarketId, resetWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
