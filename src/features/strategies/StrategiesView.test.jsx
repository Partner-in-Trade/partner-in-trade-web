import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { StrategiesView } from './StrategiesView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { API_BASE } from '@/test/msw/handlers';

const mockStrategy = {
  id: 5,
  name: 'VWAP Bounce',
  description: 'Mean reversion',
  tags: ['VWAP'],
};

function preloaded(strategies = [mockStrategy], overrides = {}) {
  const strategiesByName = Object.fromEntries(strategies.map((s) => [s.name, s.id]));
  return {
    auth: { user: mockUser, authError: null, authLoading: false },
    workspace: {
      markets: [{ id: 10, name: 'Acct', currency: 'USD', funds: 1000 }],
      selectedMarketId: 10,
      strategies,
      strategiesByName,
      strategiesSearch: '',
      strategiesLoadedSearch: '',
      strategiesLoading: false,
      strategiesError: null,
      workspaceLoading: false,
      workspaceError: null,
      ...overrides,
    },
    trades: { rawTrades: [], tradesLoading: false, tradesError: null },
  };
}

describe('StrategiesView', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API_BASE}/strategies/user/:userId`, () =>
        HttpResponse.json({
          strategies: [mockStrategy],
          pageable: { pageNumber: 0, pageSize: 100, total: 1 },
        })
      )
    );
  });

  it('shows empty state when no strategies in store', () => {
    renderWithProviders(<StrategiesView />, { preloadedState: preloaded([]) });
    expect(screen.getByText(/No strategies yet/i)).toBeInTheDocument();
  });

  it('lists strategies from Redux without refetching when search matches cache', () => {
    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    expect(screen.getByText('VWAP Bounce')).toBeInTheDocument();
  });

  it('fetches from API when searching and when clearing search', async () => {
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

    renderWithProviders(<StrategiesView />, {
      preloadedState: preloaded(
        [
          { id: 1, name: 'Alpha Setup', description: '', tags: [] },
          { id: 2, name: 'Beta Flow', description: '', tags: [] },
        ],
        { strategiesLoadedSearch: '' }
      ),
    });

    expect(screen.getByText('Alpha Setup')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Search strategies/i), {
      target: { value: 'beta' },
    });

    await waitFor(() => {
      expect(screen.getByText('Beta Flow')).toBeInTheDocument();
      expect(screen.queryByText('Alpha Setup')).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Search strategies/i), {
      target: { value: '' },
    });

    await waitFor(() => {
      expect(screen.getByText('Alpha Setup')).toBeInTheDocument();
      expect(screen.getByText('Beta Flow')).toBeInTheDocument();
    });
  });

  it('requires name when creating strategy', async () => {
    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    fireEvent.click(screen.getByRole('button', { name: /New strategy/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save strategy/i }));

    await waitFor(() => {
      expect(screen.getByText(/Strategy name is required/i)).toBeInTheDocument();
    });
  });
});
