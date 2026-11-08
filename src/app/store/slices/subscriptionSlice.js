import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchSubscriptionMe,
  fetchSubscriptionPlans,
  postCheckout,
  postStartTrial,
} from '@/features/subscription/api/subscriptionApi';
import {
  mapCheckoutResponse,
  mapPlanCatalogue,
  mapSubscriptionMe,
  parseSubscriptionError,
} from '@/features/subscription/mappers/subscriptionMapper';
import { logout } from './authSlice';

const initialState = {
  me: null,
  plans: [],
  status: 'idle',
  trialLoading: false,
  checkoutLoading: false,
  error: null,
};

export const fetchSubscriptionContext = createAsyncThunk(
  'subscription/fetchContext',
  async (_, { rejectWithValue }) => {
    try {
      const [me, plans] = await Promise.all([fetchSubscriptionMe(), fetchSubscriptionPlans()]);
      return {
        me: mapSubscriptionMe(me),
        plans: mapPlanCatalogue(plans),
      };
    } catch (error) {
      return rejectWithValue(parseSubscriptionError(error));
    }
  }
);

export const startFreeTrial = createAsyncThunk(
  'subscription/startFreeTrial',
  async (_, { rejectWithValue }) => {
    try {
      const me = await postStartTrial();
      return mapSubscriptionMe(me);
    } catch (error) {
      return rejectWithValue(parseSubscriptionError(error));
    }
  }
);

export const startCheckout = createAsyncThunk(
  'subscription/startCheckout',
  async (planCode, { rejectWithValue }) => {
    try {
      const checkout = await postCheckout(planCode);
      return mapCheckoutResponse(checkout);
    } catch (error) {
      return rejectWithValue(parseSubscriptionError(error));
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError(state) {
      state.error = null;
    },
    setSubscriptionOnboardingCompleted(state) {
      if (state.me) state.me.onboardingCompleted = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionContext.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSubscriptionContext.fulfilled, (state, action) => {
        state.status = 'ready';
        state.me = action.payload.me;
        state.plans = action.payload.plans;
      })
      .addCase(fetchSubscriptionContext.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload || { code: 'UNKNOWN', message: 'Failed to load subscription' };
      })
      .addCase(startFreeTrial.pending, (state) => {
        state.trialLoading = true;
        state.error = null;
      })
      .addCase(startFreeTrial.fulfilled, (state, action) => {
        state.trialLoading = false;
        state.me = action.payload;
      })
      .addCase(startFreeTrial.rejected, (state, action) => {
        state.trialLoading = false;
        state.error = action.payload;
      })
      .addCase(startCheckout.pending, (state) => {
        state.checkoutLoading = true;
        state.error = null;
      })
      .addCase(startCheckout.fulfilled, (state) => {
        state.checkoutLoading = false;
      })
      .addCase(startCheckout.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.error = action.payload;
      })
      .addCase(logout, () => initialState);
  },
});

export const { clearSubscriptionError, setSubscriptionOnboardingCompleted } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
