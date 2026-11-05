import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadStrategiesByName } from './ensureUserWorkspace';
import { strategiesApi } from '@/features/strategies/api/strategiesApi';

vi.mock('@/features/strategies/api/strategiesApi', () => ({
  STRATEGIES_MAX_PAGE_SIZE: 100,
  strategiesApi: {
    getByUser: vi.fn(),
    create: vi.fn(),
  },
}));

describe('loadStrategiesByName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds name to id map from API only', async () => {
    strategiesApi.getByUser.mockResolvedValue({
      data: {
        strategies: [
          { id: 1, name: 'Liquidity Sweep' },
          { id: 2, name: 'FVG' },
        ],
        pageable: { total: 2 },
      },
    });

    const map = await loadStrategiesByName(1);
    expect(map).toEqual({ 'Liquidity Sweep': 1, FVG: 2 });
    expect(strategiesApi.create).not.toHaveBeenCalled();
  });

  it('does not seed missing strategies', async () => {
    strategiesApi.getByUser.mockResolvedValue({
      data: { strategies: [], pageable: { total: 0 } },
    });

    const map = await loadStrategiesByName(42);
    expect(map).toEqual({});
    expect(strategiesApi.create).not.toHaveBeenCalled();
  });
});
