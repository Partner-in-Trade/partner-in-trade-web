import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchSubscriptionMe,
  fetchSubscriptionPlans,
  fetchSubscriptionEntitlements,
  postCheckout,
  postStartTrial,
} from '@/features/subscription/api/subscriptionApi';
import {
  mapCheckoutResponse,
  mapPlanCatalogue,
  mapSubscriptionEntitlements,
  mapSubscriptionMe,
  parseSubscriptionError,
} from '@/features/subscription/mappers/subscriptionMapper';
import { logout } from './authSlice';

const initialState = {
  me: null,
  plans: [],
  entitlements: null,
  status: 'idle',
  trialLoading: false,
  checkoutLoading: false,
  error: null,
};

export const fetchSubscriptionContext = createAsyncThunk(
  'subscription/fetchContext',
  async (_, { rejectWithValue }) => {
    try {
      const [me, plans, entitlements] = await Promise.all([
        fetchSubscriptionMe(),
        fetchSubscriptionPlans(),
        fetchSubscriptionEntitlements(),
      ]);
      return {
        me: mapSubscriptionMe(me),
        plans: mapPlanCatalogue(plans),
        entitlements: mapSubscriptionEntitlements(entitlements),
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
        state.entitlements = action.payload.entitlements;
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
        // The previous FREE entitlements are stale after trial activation.
        // Clear them so selectors fall back to the newly returned effective plan.
        state.entitlements = null;
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
