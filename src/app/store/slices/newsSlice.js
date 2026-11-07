import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newsApi } from '@/features/news/api/newsApi';
import { normalizeNewsEvents } from '@/features/news/utils/normalizeNewsEvent';
import { logout } from './authSlice';

const initialNewsState = {
  events: [],
  loading: false,
  error: null,
  fetchedAt: null,
};

export const fetchThisWeekNews = createAsyncThunk(
  'news/fetchThisWeekNews',
  async (_, { rejectWithValue }) => {
    try {
      const res = await newsApi.getThisWeek();
      return { events: normalizeNewsEvents(res.data) };
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || e.message || 'Failed to load news calendar'
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { fetchedAt, loading } = getState().news;
      return fetchedAt === null && !loading;
    },
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState: initialNewsState,
  reducers: {
    clearNewsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => ({ ...initialNewsState }))
      .addCase(fetchThisWeekNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThisWeekNews.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchThisWeekNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load news calendar';
        state.events = [];
      });
  },
});

export const { clearNewsError } = newsSlice.actions;

export const selectNewsEvents = (state) => state.news.events;
export const selectNewsLoading = (state) => state.news.loading;
export const selectNewsError = (state) => state.news.error;
export const selectNewsFetchedAt = (state) => state.news.fetchedAt;

export default newsSlice.reducer;
