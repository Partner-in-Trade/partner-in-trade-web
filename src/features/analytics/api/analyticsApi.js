import { apiClient } from '@/lib/apiClient';

export const analyticsApi = {
  getByMarket: (marketId) => apiClient.get(`/analytics/markets/${marketId}`),
};
