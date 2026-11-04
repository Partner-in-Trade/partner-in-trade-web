import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { analyticsApi } from '@/features/analytics/api/analyticsApi';
import { logout } from './authSlice';

const initialState = {
  data: null,
  loading: false,
  error: null,
  marketId: null,
  currentRequestId: null,
};

export const fetchMarketAnalytics = createAsyncThunk(
  'analytics/fetchMarketAnalytics',
  async (marketId, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getByMarket(marketId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to load analytics'
      );
    }
  },
  {
    condition: (marketId, { getState }) => {
      const { workspace, analytics } = getState();
      if (workspace.selectedMarketId !== marketId) return false;
      if (analytics.loading && analytics.marketId === marketId) return false;
      return true;
    },
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => ({ ...initialState }))
      .addCase(fetchMarketAnalytics.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.data = null;
        state.marketId = action.meta.arg;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchMarketAnalytics.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId || state.marketId !== action.meta.arg) return;
        state.loading = false;
        state.data = action.payload;
        state.marketId = action.payload.marketId;
        state.currentRequestId = null;
      })
      .addCase(fetchMarketAnalytics.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload || 'Failed to load analytics';
        state.data = null;
        state.currentRequestId = null;
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
