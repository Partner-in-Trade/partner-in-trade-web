import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import subscriptionReducer, {
  fetchSubscriptionContext,
  startFreeTrial,
} from './subscriptionSlice';
import { logout } from './authSlice';
import authReducer from './authSlice';

describe('subscriptionSlice', () => {
  it('resets on logout', () => {
    const store = configureStore({
      reducer: { subscription: subscriptionReducer, auth: authReducer },
      preloadedState: {
        subscription: {
          me: { onboardingCompleted: true },
          plans: [{ code: 'BASIC' }],
          status: 'ready',
          trialLoading: false,
          checkoutLoading: false,
          error: null,
        },
      },
    });
    store.dispatch(logout());
    expect(store.getState().subscription.status).toBe('idle');
    expect(store.getState().subscription.me).toBeNull();
  });

  it('fetchSubscriptionContext fulfilled', async () => {
    const store = configureStore({ reducer: { subscription: subscriptionReducer } });
    await store.dispatch(fetchSubscriptionContext());
    const state = store.getState().subscription;
    expect(state.status).toBe('ready');
    expect(state.me?.planCode).toBe('FREE');
    expect(state.me?.onboardingCompleted).toBe(false);
    expect(state.plans.length).toBeGreaterThan(0);
  });

  it('startFreeTrial updates me and clears stale FREE entitlements', async () => {
    const store = configureStore({
      reducer: { subscription: subscriptionReducer },
      preloadedState: {
        subscription: {
          me: { planCode: 'FREE' },
          plans: [],
          entitlements: { effectivePlanCode: 'FREE', capabilities: [] },
          status: 'ready',
          trialLoading: false,
          checkoutLoading: false,
          error: null,
        },
      },
    });
    await store.dispatch(startFreeTrial());
    expect(store.getState().subscription.me.planCode).toBe('TRIAL');
    expect(store.getState().subscription.entitlements).toBeNull();
  });
});
