import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { analyticsApi } from '@/features/analytics/api/analyticsApi';
import { logout } from './authSlice';

const initialState = {
  data: null,
  loading: false,
  error: null,
  marketId: null,
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
        state.marketId = action.meta.arg;
      })
      .addCase(fetchMarketAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.marketId = action.payload.marketId;
      })
      .addCase(fetchMarketAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load analytics';
        state.data = null;
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
