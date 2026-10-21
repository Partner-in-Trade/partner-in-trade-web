import { apiClient } from '@/lib/apiClient';

export const strategiesApi = {
  getByUser: (userId, page = 0, size = 100) =>
    apiClient.get(`/strategies/user/${userId}`, { params: { page, size } }),
  create: (strategy) => apiClient.post('/strategies/add', strategy),
};
