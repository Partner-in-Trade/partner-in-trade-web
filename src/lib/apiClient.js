import axios from 'axios';

const JWT_STORAGE_KEY = 'pit_jwt';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let onUnauthorized = null;

/** Register handler (e.g. logout) when API returns 401 */
export function setOnUnauthorized(handler) {
  onUnauthorized = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(JWT_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isDevMockJwt() {
  if (!import.meta.env.DEV) return false;
  const token = localStorage.getItem(JWT_STORAGE_KEY);
  return typeof token === 'string' && token.startsWith('mock-jwt');
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized && !isDevMockJwt()) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);
