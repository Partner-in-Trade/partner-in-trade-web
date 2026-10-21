import { apiClient } from '@/lib/apiClient';

export const authApi = {
  login: (credentials) => apiClient.post('/users/login', credentials),
  register: ({ name, email, password }) =>
    apiClient.post('/users/create', { name, email, password }),
};
