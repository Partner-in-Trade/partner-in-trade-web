import axios from 'axios';

const JWT_STORAGE_KEY = 'pit_jwt';

const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 90_000;
const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1';
const PRODUCTION_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL_PROD ||
  'https://partner-in-trade.onrender.com/api/v1';

// Vite sets PROD at build time, so production builds cannot accidentally use localhost.
const API_BASE_URL = import.meta.env.PROD
  ? PRODUCTION_API_BASE_URL
  : LOCAL_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT_MS,
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
