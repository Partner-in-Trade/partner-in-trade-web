import { describe, it, expect, beforeEach } from 'vitest';
import {
  mapLoginResponse,
  persistAuthSession,
  clearAuthSession,
  AUTH_STORAGE_KEY,
} from './authMapper';

describe('authMapper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mapLoginResponse maps success payload', () => {
    const result = mapLoginResponse({
      data: {
        success: true,
        accessToken: 'tok',
        user: { id: 7, name: 'Alex', email: 'a@b.com' },
      },
    });
    expect(result.user).toMatchObject({
      id: '7',
      fullName: 'Alex',
      email: 'a@b.com',
    });
    expect(result.token).toBe('tok');
  });

  it('mapLoginResponse returns error when unsuccessful', () => {
    const result = mapLoginResponse({
      data: { success: false, message: 'Nope' },
    });
    expect(result.error).toBe('Nope');
  });

  it('persistAuthSession and clearAuthSession manage storage keys', () => {
    const user = { id: '1', fullName: 'T', email: 't@t.com' };
    persistAuthSession(user, 'jwt');
    expect(localStorage.getItem('pit_jwt')).toBe('jwt');
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))).toEqual(user);
    clearAuthSession();
    expect(localStorage.getItem('pit_jwt')).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
