import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from '@/lib/apiClient';
import { postCancelSubscription } from './subscriptionApi';

describe('subscriptionApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requests cancellation through the backend subscription endpoint', async () => {
    const response = { cancelAtPeriodEnd: true, currentPeriodEnd: '2026-12-01T00:00:00Z' };
    apiClient.post.mockResolvedValue({ data: response });

    await expect(postCancelSubscription()).resolves.toEqual(response);
    expect(apiClient.post).toHaveBeenCalledWith('/subscriptions/cancel');
  });
});
