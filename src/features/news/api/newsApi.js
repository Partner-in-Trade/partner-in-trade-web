import { apiClient } from '@/lib/apiClient';

export const newsApi = {
  getThisWeek: () => apiClient.get('/news/this-week'),
};
