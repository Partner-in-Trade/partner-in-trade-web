import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/lib/apiClient';
import { tradesApi } from './tradesApi';

describe('tradesApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates a trade through the backend PUT endpoint', async () => {
    const trade = { id: 'trade-1', entryPrice: 125 };
    apiClient.put.mockResolvedValue({ data: trade });

    await tradesApi.update('trade-1', trade);

    expect(apiClient.put).toHaveBeenCalledWith('/trades/trade-1', trade);
  });
});
