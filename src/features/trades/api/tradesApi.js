import { apiClient } from '@/lib/apiClient';
export const tradesApi = {
  getAllTrades: (params = {}) => apiClient.get('/trades', { params }),
  createTrade: (payload) => apiClient.post('/trades', payload),
  deleteTrade: (id) => apiClient.delete(`/trades/${id}`),
};