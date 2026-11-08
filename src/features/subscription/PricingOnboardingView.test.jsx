import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingOnboardingView } from './PricingOnboardingView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockSubscriptionMe, mockSubscriptionPlans } from '@/test/fixtures';
import * as razorpay from '@/features/subscription/razorpay/loadRazorpayCheckout';

describe('PricingOnboardingView', () => {
  const baseSubscription = {
    me: mockSubscriptionMe({ onboardingCompleted: false }),
    plans: mockSubscriptionPlans().filter((p) => p.code !== 'FREE'),
    status: 'ready',
    trialLoading: false,
    checkoutLoading: false,
    error: null,
  };

  it('renders hero and plan prices', () => {
    renderWithProviders(<PricingOnboardingView />, {
      preloadedState: {
        auth: { user: { id: '1', email: 'a@test.com' }, authError: null, authLoading: false },
        subscription: baseSubscription,
      },
    });
    expect(screen.getByText('Simple pricing for serious traders')).toBeInTheDocument();
    expect(screen.getByText('₹299')).toBeInTheDocument();
    expect(screen.getByText('₹499')).toBeInTheDocument();
  });

  it('start trial dispatches thunk', async () => {
    const { store } = renderWithProviders(<PricingOnboardingView />, {
      preloadedState: {
        auth: { user: { id: '1', email: 'a@test.com' }, authError: null, authLoading: false },
        subscription: baseSubscription,
      },
    });
    fireEvent.click(screen.getAllByRole('button', { name: /Start your free trial/i })[0]);
    await waitFor(() => {
      expect(store.getState().subscription.me?.planCode).toBe('TRIAL');
    });
  });

  it('choose basic triggers checkout', async () => {
    vi.spyOn(razorpay, 'openRazorpaySubscriptionCheckout').mockResolvedValue({ success: true });
    renderWithProviders(<PricingOnboardingView />, {
      preloadedState: {
        auth: { user: { id: '1', email: 'a@test.com' }, authError: null, authLoading: false },
        subscription: baseSubscription,
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Choose Basic' }));
    await waitFor(() => {
      expect(razorpay.openRazorpaySubscriptionCheckout).toHaveBeenCalled();
    });
  });
});
