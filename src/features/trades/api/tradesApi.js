import { apiClient } from '@/lib/apiClient';

export const tradesApi = {
  getByMarket: (marketId) => apiClient.get(`/trades/market/${marketId}`),
  getById: (tradeId) => apiClient.get(`/trades/${tradeId}`),
  create: (payload) => apiClient.post('/trades/add', payload),
  delete: (tradeId) => apiClient.delete(`/trades/${tradeId}`),
};
