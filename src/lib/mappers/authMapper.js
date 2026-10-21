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

export { AUTH_STORAGE_KEY, JWT_STORAGE_KEY };
