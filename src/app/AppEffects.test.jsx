import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { AppEffects } from './AppEffects';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser } from '@/test/fixtures';
import { AUTH_STORAGE_KEY } from '@/lib/mappers/authMapper';
import * as apiClient from '@/lib/apiClient';

describe('AppEffects', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    apiClient.setOnUnauthorized(null);
  });

  it('bootstraps workspace when user is present', async () => {
    const { store } = renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
      },
    });
    await waitFor(() => {
      expect(store.getState().workspace.markets.length).toBeGreaterThan(0);
    });
  });

  it('fetches trades after workspace bootstrap', async () => {
    const { store } = renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
      },
    });
    await waitFor(() => {
      expect(store.getState().trades.rawTrades.length).toBeGreaterThan(0);
    });
  });

  it('persists user to localStorage', async () => {
    renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
      },
    });
    await waitFor(() => {
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain(mockUser.email);
    });
  });

  it('registers unauthorized handler that logs out', async () => {
    let unauthorizedHandler;
    vi.spyOn(apiClient, 'setOnUnauthorized').mockImplementation((handler) => {
      unauthorizedHandler = handler;
    });

    const { store } = renderWithProviders(<AppEffects />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
      },
    });

    await waitFor(() => expect(unauthorizedHandler).toBeTypeOf('function'));
    unauthorizedHandler();
    expect(store.getState().auth.user).toBeNull();
  });
});
