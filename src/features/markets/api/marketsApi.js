import { apiClient } from '@/lib/apiClient';

export const marketsApi = {
  getMarkets: (userId) => apiClient.get('/markets', { params: { userId } }),
  createMarket: (name, userId) => apiClient.post('/markets/create', { name, userId }),
};
