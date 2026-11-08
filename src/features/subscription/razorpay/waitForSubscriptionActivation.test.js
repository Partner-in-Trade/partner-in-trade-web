import { describe, expect, it, vi } from 'vitest';
import { waitForSubscriptionActivation } from './waitForSubscriptionActivation';

describe('waitForSubscriptionActivation', () => {
  it('keeps paid access pending until the backend confirms ACTIVE after a delayed webhook', async () => {
    const fetchSubscriptionMe = vi.fn()
      .mockResolvedValueOnce({ status: 'PENDING', effectivePlanCode: 'FREE' })
      .mockResolvedValueOnce({ status: 'PENDING', effectivePlanCode: 'FREE' })
      .mockResolvedValueOnce({ status: 'ACTIVE', effectivePlanCode: 'BASIC' });
    const wait = vi.fn().mockResolvedValue(undefined);

    const activated = await waitForSubscriptionActivation({
      planCode: 'BASIC',
      fetchSubscriptionMe,
      intervalMs: 1500,
      wait,
    });

    expect(activated).toBe(true);
    expect(fetchSubscriptionMe).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenCalledTimes(2);
    expect(wait).toHaveBeenNthCalledWith(1, 1500);
    expect(wait).toHaveBeenNthCalledWith(2, 1500);
  });

  it('does not confirm paid access when backend verification remains pending', async () => {
    const fetchSubscriptionMe = vi.fn().mockResolvedValue({
      status: 'PENDING',
      effectivePlanCode: 'FREE',
    });

    const activated = await waitForSubscriptionActivation({
      planCode: 'PRO',
      fetchSubscriptionMe,
      maxAttempts: 3,
      wait: vi.fn().mockResolvedValue(undefined),
    });

    expect(activated).toBe(false);
    expect(fetchSubscriptionMe).toHaveBeenCalledTimes(3);
  });

  it('does not confirm a different active plan', async () => {
    const fetchSubscriptionMe = vi.fn().mockResolvedValue({
      status: 'ACTIVE',
      effectivePlanCode: 'BASIC',
    });

    const activated = await waitForSubscriptionActivation({
      planCode: 'PRO',
      fetchSubscriptionMe,
      maxAttempts: 2,
      wait: vi.fn().mockResolvedValue(undefined),
    });

    expect(activated).toBe(false);
  });
});
