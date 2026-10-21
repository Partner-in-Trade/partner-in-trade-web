import { apiClient } from '@/lib/apiClient';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (payload) => apiClient.post('/auth/register', payload),
  getCurrentUser: () => apiClient.get('/auth/me'),
};