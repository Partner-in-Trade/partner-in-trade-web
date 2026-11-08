const AUTH_STORAGE_KEY = 'pit_auth_user_v1';
const JWT_STORAGE_KEY = 'pit_jwt';

/**
 * @typedef {Object} AppUser
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} accountType
 * @property {string} baseCurrency
 */

/**
 * @param {import('axios').AxiosResponse} response
 * @returns {{ user: AppUser, token: string } | { error: string }}
 */
export function mapLoginResponse(response) {
  const data = response.data;
  if (!data?.success || !data.accessToken) {
    return { error: data?.message || 'Authentication failed' };
  }
  const user = {
    id: String(data.user.id),
    fullName: data.user.name,
    email: data.user.email,
    accountType: 'LIVE PRO',
    baseCurrency: 'USD',
  };
  return { user, token: data.accessToken };
}

export function persistAuthSession(user, token) {
  localStorage.setItem(JWT_STORAGE_KEY, token);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(JWT_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * @param {unknown} data - axios error response body
 * @param {string} fallback
 */
export function parseApiErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.success === false && data.message) return data.message;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first?.defaultMessage === 'string' && first.defaultMessage) {
      return first.defaultMessage;
    }
  }
  if (typeof data.message === 'string' && data.message) {
    return data.message;
  }
  return fallback;
}

export { AUTH_STORAGE_KEY, JWT_STORAGE_KEY };
