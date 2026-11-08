import { apiClient } from '@/lib/apiClient';

/**
 * Create body (maps 1:1 to StrategyCreateRequest):
 * name, description, tags, rulesSetup, worksInTrendingMarket, worksInRangingMarket,
 * marketTypes, timeframes, sessions, preferredSymbols, riskNotes, isActive
 */

/** Must match backend StrategyService.MAX_PAGE_SIZE (100). */
export const STRATEGIES_MAX_PAGE_SIZE = 100;

export const strategiesApi = {
  getByUser: (userId, page = 0, size = STRATEGIES_MAX_PAGE_SIZE, search) =>
    apiClient.get(`/strategies/user/${userId}`, {
      params: {
        page,
        size,
        ...(search && search.trim() ? { search: search.trim() } : {}),
      },
    }),
  getById: (strategyId) => apiClient.get(`/strategies/${strategyId}`),
  getTrades: (strategyId) => apiClient.get(`/strategies/${strategyId}/trades`),
  create: (strategy) => apiClient.post('/strategies/add', strategy),
  update: (strategyId, strategy) => apiClient.put('/strategies/' + strategyId, strategy),
  delete: (strategyId) => apiClient.delete(`/strategies/${strategyId}`),
};
