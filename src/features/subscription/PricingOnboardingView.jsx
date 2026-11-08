import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubscriptionContext,
  startCheckout,
  startFreeTrial,
  selectCheckoutLoading,
  selectSubscriptionError,
  selectSubscriptionPlans,
  selectTrialLoading,
  clearSubscriptionError,
} from '@/app/store';
import { openRazorpaySubscriptionCheckout } from '@/features/subscription/razorpay/loadRazorpayCheckout';
import { fetchSubscriptionMe } from '@/features/subscription/api/subscriptionApi';
import { TrialHeroSection } from './components/TrialHeroSection';
import { PlanCardsSection } from './components/PlanCardsSection';
import {
  ComparePlansAnchor,
  ComparePlansSection,
} from './components/ComparePlansSection';
import { TrustFaqSection } from './components/TrustFaqSection';
import { PricingFooterCta } from './components/PricingFooterCta';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForSubscriptionActivation(planCode) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const subscription = await fetchSubscriptionMe();
      if (subscription?.status === 'ACTIVE' && subscription?.effectivePlanCode === planCode) {
        return true;
      }
    } catch {
      // Webhook processing and short-lived API/network failures can overlap.
      // Keep polling; the final refresh below will surface the latest state.
    }
    if (attempt < 9) await delay(1500);
  }
  return false;
}

export function PricingOnboardingView() {
  const dispatch = useDispatch();
  const [checkoutSyncPending, setCheckoutSyncPending] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const compareRef = useRef(null);
  const plans = useSelector(selectSubscriptionPlans);
  const trialLoading = useSelector(selectTrialLoading);
  const checkoutLoading = useSelector(selectCheckoutLoading);
  const error = useSelector(selectSubscriptionError);

  const scrollToCompare = () => {
    compareRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartTrial = async () => {
    dispatch(clearSubscriptionError());
    const result = await dispatch(startFreeTrial());
    if (startFreeTrial.fulfilled.match(result)) {
      return;
    }
  };

  const handleCheckout = async (planCode) => {
    dispatch(clearSubscriptionError());
    setCheckoutSyncPending(false);
    setCheckoutMessage('');
    const result = await dispatch(startCheckout(planCode));
    if (!startCheckout.fulfilled.match(result)) return;
    const payload = result.payload;
    try {
      // Razorpay's client callback is not authoritative. Only the backend's
      // verified subscription state can activate plan capabilities.
      await openRazorpaySubscriptionCheckout({
        keyId: payload.keyId,
        subscriptionId: payload.subscriptionId,
      });
      const activated = await waitForSubscriptionActivation(planCode);
      await dispatch(fetchSubscriptionContext());
      setCheckoutSyncPending(!activated);
      setCheckoutMessage(activated ? '' : 'Payment confirmation is still pending with the payment provider. Your plan will unlock only after the backend verifies it.');
    } catch (e) {
      console.warn('Checkout flow:', e);
      await dispatch(fetchSubscriptionContext());
      setCheckoutSyncPending(false);
      setCheckoutMessage(
        e?.message === 'Checkout dismissed'
          ? 'Checkout was closed. No paid access was granted.'
          : e?.message === 'Payment failed'
            ? 'Payment failed. No paid access was granted.'
            : 'Checkout could not be completed. Subscription access was not changed unless confirmed by the server.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-pit-bg text-slate-100 overflow-y-auto">
      <TrialHeroSection onStartTrial={handleStartTrial} trialLoading={trialLoading} />
      <ComparePlansAnchor onScroll={scrollToCompare} />
      <PlanCardsSection
        plans={plans}
        onChooseBasic={() => handleCheckout('BASIC')}
        onChoosePro={() => handleCheckout('PRO')}
        checkoutLoading={checkoutLoading}
      />
      <ComparePlansSection compareRef={compareRef} />
      {checkoutSyncPending && (
        <p className="text-center text-sm text-amber-300 px-4" role="status">
          Checkout completed. Your subscription is still being activated; please refresh in a moment.
        </p>
      )}
      {error && (
        <p className="text-center text-sm text-rose-400 px-4" role="alert">
          {error.message}
          {error.code === 'SUBSCRIPTION_PAYMENT_UNAVAILABLE' &&
            ' — Payments are not configured in this environment.'}
        </p>
      )}
      <TrustFaqSection />
      <PricingFooterCta onStartTrial={handleStartTrial} trialLoading={trialLoading} />
    </div>
  );
}
