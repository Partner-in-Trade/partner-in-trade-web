import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { StrategiesView } from './StrategiesView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { API_BASE } from '@/test/msw/handlers';

const basePreloaded = {
  auth: { user: mockUser, authError: null, authLoading: false },
  workspace: {
    markets: [{ id: 10, name: 'Acct', currency: 'USD', funds: 1000 }],
    selectedMarketId: 10,
    strategiesByName: {},
    workspaceLoading: false,
    workspaceError: null,
  },
  trades: { rawTrades: [], tradesLoading: false, tradesError: null },
};

describe('StrategiesView', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API_BASE}/strategies/user/:userId`, () =>
        HttpResponse.json({
          strategies: [{ id: 5, name: 'VWAP Bounce', description: 'Mean reversion', tags: ['VWAP'] }],
          pageable: { pageNumber: 0, pageSize: 100, total: 1 },
        })
      )
    );
  });

  it('shows empty state when no strategies returned', async () => {
    server.use(
      http.get(`${API_BASE}/strategies/user/:userId`, () =>
        HttpResponse.json({
          strategies: [],
          pageable: { pageNumber: 0, pageSize: 100, total: 0 },
        })
      )
    );

    renderWithProviders(<StrategiesView />, { preloadedState: basePreloaded });

    await waitFor(() => {
      expect(screen.getByText(/No strategies yet/i)).toBeInTheDocument();
    });
  });

  it('lists strategies from API', async () => {
    renderWithProviders(<StrategiesView />, { preloadedState: basePreloaded });

    await waitFor(() => {
      expect(screen.getByText('VWAP Bounce')).toBeInTheDocument();
    });
  });

  it('filters strategies when searching', async () => {
    server.use(
      http.get(`${API_BASE}/strategies/user/:userId`, ({ request }) => {
        const search = (new URL(request.url).searchParams.get('search') || '').toLowerCase();
        const all = [
          { id: 1, name: 'Alpha Setup', description: '', tags: [] },
          { id: 2, name: 'Beta Flow', description: '', tags: [] },
        ];
        const filtered = search
          ? all.filter((s) => s.name.toLowerCase().includes(search))
          : all;
        return HttpResponse.json({
          strategies: filtered,
          pageable: { pageNumber: 0, pageSize: 100, total: filtered.length },
        });
      })
    );

    renderWithProviders(<StrategiesView />, { preloadedState: basePreloaded });

    await waitFor(() => expect(screen.getByText('Alpha Setup')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/Search strategies/i), {
      target: { value: 'beta' },
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 350));
    });

    await waitFor(() => {
      expect(screen.getByText('Beta Flow')).toBeInTheDocument();
      expect(screen.queryByText('Alpha Setup')).not.toBeInTheDocument();
    });
  });

  it('requires name when creating strategy', async () => {
    renderWithProviders(<StrategiesView />, { preloadedState: basePreloaded });

    await waitFor(() => screen.getByRole('button', { name: /New strategy/i }));
    fireEvent.click(screen.getByRole('button', { name: /New strategy/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save strategy/i }));

    await waitFor(() => {
      expect(screen.getByText(/Strategy name is required/i)).toBeInTheDocument();
    });
  });
});
