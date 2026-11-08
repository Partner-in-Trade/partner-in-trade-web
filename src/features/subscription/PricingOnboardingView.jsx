import React, { useRef } from 'react';
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
import { TrialHeroSection } from './components/TrialHeroSection';
import { PlanCardsSection } from './components/PlanCardsSection';
import {
  ComparePlansAnchor,
  ComparePlansSection,
} from './components/ComparePlansSection';
import { TrustFaqSection } from './components/TrustFaqSection';
import { PricingFooterCta } from './components/PricingFooterCta';

export function PricingOnboardingView() {
  const dispatch = useDispatch();
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
    const result = await dispatch(startCheckout(planCode));
    if (!startCheckout.fulfilled.match(result)) return;
    const payload = result.payload;
    try {
      await openRazorpaySubscriptionCheckout({
        keyId: payload.keyId,
        subscriptionId: payload.subscriptionId,
      });
      await dispatch(fetchSubscriptionContext());
    } catch (e) {
      console.warn('Checkout flow:', e);
      await dispatch(fetchSubscriptionContext());
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
