import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureStrategies } from './ensureUserWorkspace';
import { strategiesApi } from '@/features/strategies/api/strategiesApi';
import { PLAYBOOK_SETUPS } from '@/data/mockTrades';

vi.mock('@/features/strategies/api/strategiesApi', () => ({
  strategiesApi: {
    getByUser: vi.fn(),
    create: vi.fn(),
  },
}));

describe('ensureStrategies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns existing strategies without creating duplicates', async () => {
    strategiesApi.getByUser.mockResolvedValue({
      data: {
        strategies: PLAYBOOK_SETUPS.map((name, index) => ({ id: index + 1, name })),
      },
    });

    const map = await ensureStrategies(1);
    expect(map[PLAYBOOK_SETUPS[0]]).toBe(1);
    expect(strategiesApi.create).not.toHaveBeenCalled();
  });

  it('creates missing playbook strategies', async () => {
    const missing = PLAYBOOK_SETUPS[1];
    strategiesApi.getByUser.mockResolvedValue({
      data: { strategies: [{ id: 1, name: PLAYBOOK_SETUPS[0] }] },
    });
    strategiesApi.create.mockImplementation(async (body) => ({
      data: { id: 99, name: body.name },
    }));

    const map = await ensureStrategies(1);
    expect(map[missing]).toBe(99);
    expect(strategiesApi.create).toHaveBeenCalled();
  });
});
