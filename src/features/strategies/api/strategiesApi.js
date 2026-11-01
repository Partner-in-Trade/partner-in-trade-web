import { apiClient } from '@/lib/apiClient';

export const strategiesApi = {
  getByUser: (userId, page = 0, size = 100, search) =>
    apiClient.get(`/strategies/user/${userId}`, {
      params: {
        page,
        size,
        ...(search && search.trim() ? { search: search.trim() } : {}),
      },
    }),
  create: (strategy) => apiClient.post('/strategies/add', strategy),
};
