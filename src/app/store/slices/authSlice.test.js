import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '@/test/renderWithProviders';
import {
  login,
  register,
  logout,
  clearAuthError,
  bypassAuth,
  loginWithGoogle,
} from './authSlice';
import { AUTH_STORAGE_KEY } from '@/lib/mappers/authMapper';
import { mockUser } from '@/test/fixtures';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_BASE } from '@/test/msw/handlers';

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('login fulfilled sets user and clears error', async () => {
    const store = createTestStore();
    await store.dispatch(login({ email: 'test@example.com', password: 'secret' }));
    const state = store.getState().auth;
    expect(state.user?.email).toBe('test@example.com');
    expect(state.authError).toBeNull();
    expect(localStorage.getItem('pit_jwt')).toBe('jwt-test-token');
  });

  it('login rejected sets authError', async () => {
    const store = createTestStore();
    await store.dispatch(login({ email: 'test@example.com', password: 'bad' }));
    expect(store.getState().auth.authError).toBeTruthy();
    expect(store.getState().auth.user).toBeNull();
  });

  it('register fulfilled sets user', async () => {
    const store = createTestStore();
    await store.dispatch(
      register({ fullName: 'Test', email: 'new@example.com', password: 'secret' })
    );
    expect(store.getState().auth.user?.fullName).toBe('Test User');
  });

  it('logout clears user and session', () => {
    const store = createTestStore({
      auth: { user: mockUser, authError: 'x', authLoading: false },
    });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    store.dispatch(logout());
    expect(store.getState().auth.user).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('clearAuthError clears message', () => {
    const store = createTestStore({
      auth: { user: null, authError: 'err', authLoading: false },
    });
    store.dispatch(clearAuthError());
    expect(store.getState().auth.authError).toBeNull();
  });

  it('bypassAuth and loginWithGoogle set mock user in dev', () => {
    const store = createTestStore();
    store.dispatch(bypassAuth());
    expect(store.getState().auth.user?.fullName).toBe('Alex Mercer');
    store.dispatch(logout());
    store.dispatch(loginWithGoogle());
    expect(store.getState().auth.user?.authProvider).toBe('google');
  });

  it('logout resets workspace and trades slices', async () => {
    const store = createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
      workspace: {
        markets: [{ id: 1, name: 'X' }],
        selectedMarketId: 1,
        strategiesByName: { a: 1 },
        workspaceLoading: false,
        workspaceError: null,
      },
      trades: {
        rawTrades: [{ id: '1' }],
        tradesLoading: false,
        tradesError: null,
        isAddModalOpen: true,
        prefillDate: '2025-01-01',
        selectedTrade: { id: '1' },
      },
    });
    store.dispatch(logout());
    expect(store.getState().workspace.markets).toEqual([]);
    expect(store.getState().trades.rawTrades).toEqual([]);
    expect(store.getState().trades.isAddModalOpen).toBe(false);
  });

  it('register rejected parses Spring validation errors', async () => {
    server.use(
      http.post(`${API_BASE}/users/create`, () =>
        HttpResponse.json(
          {
            message: "Validation failed for object='registerRequest'. Error count: 1",
            errors: [{ defaultMessage: 'Password must be between 10 and 128 characters' }],
          },
          { status: 400 }
        )
      )
    );
    const store = createTestStore();
    await store.dispatch(
      register({ fullName: 'Test User', email: 't@t.com', password: '1234567890' })
    );
    expect(store.getState().auth.authError).toBe(
      'Password must be between 10 and 128 characters'
    );
  });

  it('register rejected uses API message', async () => {
    server.use(
      http.post(`${API_BASE}/users/create`, () =>
        HttpResponse.json({ success: false, message: 'Email taken' }, { status: 400 })
      )
    );
    const store = createTestStore();
    await store.dispatch(
      register({ fullName: 'T', email: 't@t.com', password: 'x' })
    );
    expect(store.getState().auth.authError).toBe('Email taken');
  });
});
