import { apiClient } from '@/lib/apiClient';

export const marketsApi = {
  getMarkets: (userId) => apiClient.get('/markets', { params: { userId } }),
  createMarket: (name, userId, type) =>
    apiClient.post('/markets/create', { name, userId, type }),
  activateMarket: (marketId, body) => apiClient.put(`/markets/${marketId}/activate`, body),
  addFunds: (marketId, body) => apiClient.put(`/markets/${marketId}/funds`, body),
  deleteMarket: (marketId, userId) =>
    apiClient.delete(`/markets/${marketId}`, { params: { userId } }),
};
