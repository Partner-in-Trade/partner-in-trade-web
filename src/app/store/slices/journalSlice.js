import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { journalApi } from '@/features/journal/api/journalApi';
import { journalMediaApi } from '@/features/journal/api/journalMediaApi';
import { prepareJournalFormForSave } from '@/features/journal/utils/journalMediaUpload';
import {
  dailyJournalFromApi,
  dailyJournalToApi,
  summaryMapFromList,
} from '@/features/journal/mappers/journalMapper';
import { emptyDailyJournalForm, journalFormHasContent, todayIsoDate } from '@/constants/journal';
import { logout } from './authSlice';

const initialState = {
  summariesByDate: {},
  dailyByDate: {},
  dailyLoading: false,
  dailySaving: false,
  dailyError: null,
  selectedDate: todayIsoDate(),
  mainView: 'day',
  journalNavExpanded: false,
};

export const fetchJournalRange = createAsyncThunk(
  'journal/fetchJournalRange',
  async ({ from, to }, { rejectWithValue }) => {
    try {
      const res = await journalApi.listDailySummaries(from, to);
      return { summaries: res.data || [] };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to load journals');
    }
  }
);

export const fetchJournalByDate = createAsyncThunk(
  'journal/fetchJournalByDate',
  async (date, { rejectWithValue }) => {
    try {
      const res = await journalApi.getDailyJournal(date);
      if (res.status === 204 || res.data == null || res.data === '') {
        return { date, journal: null };
      }
      return { date, journal: res.data };
    } catch (e) {
      if (e.response?.status === 204) {
        return { date, journal: null };
      }
      return rejectWithValue(e.response?.data?.message || e.message || 'Failed to load journal');
    }
  }
);

export const saveDailyJournal = createAsyncThunk(
  'journal/saveDailyJournal',
  async ({ date, form, pendingUploads = {} }, { rejectWithValue }) => {
    try {
      const prepared = await prepareJournalFormForSave({
        journalDate: date,
        form,
        pendingUploads,
        uploadFile: (file, journalDate) => journalMediaApi.uploadImage(file, journalDate),
      });
      const res = await journalApi.upsertDailyJournal(date, dailyJournalToApi(prepared));
      return { date, journal: res.data };
    } catch (e) {
      const message =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to save journal';
      return rejectWithValue(message);
    }
  }
);

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    setJournalSelectedDate(state, action) {
      state.selectedDate = action.payload;
    },
    setJournalMainView(state, action) {
      state.mainView = action.payload;
    },
    setJournalNavExpanded(state, action) {
      state.journalNavExpanded = action.payload;
    },
    openWriteJournal(state, action) {
      if (action.payload) {
        state.selectedDate = action.payload;
      }
      state.mainView = 'write';
      state.journalNavExpanded = true;
    },
    openJournalDayView(state, action) {
      if (action.payload) {
        state.selectedDate = action.payload;
      }
      state.mainView = 'day';
      state.journalNavExpanded = true;
    },
    /** @deprecated use openJournalDayView */
    openJournalCalendar(state, action) {
      if (action.payload) {
        state.selectedDate = action.payload;
      }
      state.mainView = 'day';
      state.journalNavExpanded = true;
    },
    clearJournalError(state) {
      state.dailyError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => ({ ...initialState }))
      .addCase(fetchJournalRange.fulfilled, (state, action) => {
        state.summariesByDate = {
          ...state.summariesByDate,
          ...summaryMapFromList(action.payload.summaries),
        };
      })
      .addCase(fetchJournalByDate.pending, (state) => {
        state.dailyLoading = true;
        state.dailyError = null;
      })
      .addCase(fetchJournalByDate.fulfilled, (state, action) => {
        state.dailyLoading = false;
        const { date, journal } = action.payload;
        const form = journal ? dailyJournalFromApi(journal) : emptyDailyJournalForm();
        state.dailyByDate[date] = form;
        state.summariesByDate[date] = {
          journalDate: date,
          hasEntry: journal != null && journalFormHasContent(form),
        };
      })
      .addCase(fetchJournalByDate.rejected, (state, action) => {
        state.dailyLoading = false;
        state.dailyError = action.payload;
        if (action.meta?.arg) {
          state.dailyByDate[action.meta.arg] = emptyDailyJournalForm();
        }
      })
      .addCase(saveDailyJournal.pending, (state) => {
        state.dailySaving = true;
        state.dailyError = null;
      })
      .addCase(saveDailyJournal.fulfilled, (state, action) => {
        state.dailySaving = false;
        const { date, journal } = action.payload;
        const form = dailyJournalFromApi(journal);
        state.dailyByDate[date] = form;
        state.summariesByDate[date] = {
          journalDate: date,
          hasEntry: journalFormHasContent(form),
        };
        state.mainView = 'day';
      })
      .addCase(saveDailyJournal.rejected, (state, action) => {
        state.dailySaving = false;
        state.dailyError = action.payload;
      });
  },
});

export const {
  setJournalSelectedDate,
  setJournalMainView,
  setJournalNavExpanded,
  openWriteJournal,
  openJournalDayView,
  openJournalCalendar,
  clearJournalError,
} = journalSlice.actions;

export const selectJournalSummariesByDate = (state) => state.journal.summariesByDate;
export const selectJournalSelectedDate = (state) => state.journal.selectedDate;
export const selectJournalMainView = (state) => state.journal.mainView;
export const selectJournalNavExpanded = (state) => state.journal.journalNavExpanded;
export const selectDailyJournalForm = (date) => (state) =>
  state.journal.dailyByDate[date] ?? emptyDailyJournalForm();
export const selectDailyJournalLoading = (state) => state.journal.dailyLoading;
export const selectDailyJournalSaving = (state) => state.journal.dailySaving;
export const selectDailyJournalError = (state) => state.journal.dailyError;
export const selectJournalHasEntry = (date) => (state) =>
  Boolean(state.journal.summariesByDate[date]?.hasEntry);

export default journalSlice.reducer;
