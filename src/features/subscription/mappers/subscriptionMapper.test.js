import { describe, it, expect } from 'vitest';
import {
  mapCheckoutResponse,
  mapPlanCatalogue,
  mapSubscriptionMe,
  parseSubscriptionError,
} from './subscriptionMapper';

describe('subscriptionMapper', () => {
  it('maps subscription me', () => {
    const mapped = mapSubscriptionMe({
      planCode: 'FREE',
      effectivePlanCode: 'FREE',
      status: 'ACTIVE',
      onboardingCompleted: false,
    });
    expect(mapped.onboardingCompleted).toBe(false);
    expect(mapped.planCode).toBe('FREE');
  });

  it('maps plan catalogue', () => {
    const plans = mapPlanCatalogue([{ code: 'BASIC', displayName: 'Basic', pricePaise: 29900, priceInr: 299 }]);
    expect(plans[0].priceInr).toBe(299);
  });

  it('maps checkout response', () => {
    const checkout = mapCheckoutResponse({ keyId: 'rzp_test', subscriptionId: 'sub_1', planCode: 'PRO' });
    expect(checkout.subscriptionId).toBe('sub_1');
  });

  it('parses subscription API error', () => {
    const parsed = parseSubscriptionError({
      response: { data: { code: 'PLAN_CAPABILITY_DENIED', message: 'Denied' } },
    });
    expect(parsed.code).toBe('PLAN_CAPABILITY_DENIED');
  });
});
