import { apiClient } from '@/lib/apiClient';

export const journalApi = {
  listDailySummaries: (from, to) =>
    apiClient.get('/daily-journals', { params: { from, to } }),

  getDailyJournal: async (date) => {
    try {
      return await apiClient.get(`/daily-journals/${date}`);
    } catch (e) {
      if (e.response?.status === 204) {
        return { status: 204, data: null };
      }
      throw e;
    }
  },

  upsertDailyJournal: (date, body) => apiClient.put(`/daily-journals/${date}`, body),
};
