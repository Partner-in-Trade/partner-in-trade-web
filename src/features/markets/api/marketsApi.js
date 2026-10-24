import { apiClient } from '@/lib/apiClient';

export const marketsApi = {
  getMarkets: (userId) => apiClient.get('/markets', { params: { userId } }),
  createMarket: (name, userId) => apiClient.post('/markets/create', { name, userId }),
  activateMarket: (marketId, body) => apiClient.put(`/markets/${marketId}/activate`, body),
  addFunds: (marketId, body) => apiClient.put(`/markets/${marketId}/funds`, body),
};
