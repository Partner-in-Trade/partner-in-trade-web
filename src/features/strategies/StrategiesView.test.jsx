import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  description: 'Mean reversion setup',
  rulesSetup: 'Wait for VWAP touch',
  tags: ['VWAP'],
  marketTypes: ['Stocks'],
  isActive: true,
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
    expect(screen.getByText(/Start blank/i)).toBeInTheDocument();
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
          {
            id: 1,
            name: 'Alpha Setup',
            description: 'Active playbook',
            tags: [],
            isActive: true,
            marketTypes: ['Futures'],
          },
          {
            id: 2,
            name: 'Beta Flow',
            description: 'Active playbook',
            tags: [],
            isActive: true,
            marketTypes: ['Forex'],
          },
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
          {
            id: 1,
            name: 'Alpha Setup',
            description: 'Active playbook',
            tags: [],
            isActive: true,
            marketTypes: ['Futures'],
          },
          {
            id: 2,
            name: 'Beta Flow',
            description: 'Active playbook',
            tags: [],
            isActive: true,
            marketTypes: ['Forex'],
          },
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

  it('filters drafts when Drafts tab is selected', () => {
    renderWithProviders(<StrategiesView />, {
      preloadedState: preloaded([
        { id: 1, name: 'Live', description: 'x', isActive: true, marketTypes: ['Stocks'] },
        { id: 2, name: 'Sketch', description: '', isActive: false, marketTypes: [] },
      ]),
    });
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.queryByText('Sketch')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Drafts' }));
    expect(screen.getByText('Sketch')).toBeInTheDocument();
    expect(screen.queryByText('Live')).not.toBeInTheDocument();
  });

  it('requires name when creating strategy', async () => {
    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    fireEvent.click(screen.getByRole('button', { name: /Create new strategy/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save & activate/i }));

    await waitFor(() => {
      expect(screen.getByText(/Strategy name is required/i)).toBeInTheDocument();
    });
  });


  it('opens an existing strategy in edit mode and persists the mapped update payload', async () => {
    let received;
    server.use(
      http.put(`${API_BASE}/strategies/:strategyId`, async ({ params, request }) => {
        received = { id: Number(params.strategyId), body: await request.json() };
        return HttpResponse.json({ ...mockStrategy, ...received.body, id: Number(params.strategyId) });
      })
    );

    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    fireEvent.click(screen.getByRole('button', { name: /Open playbook/i }));
    fireEvent.click(await screen.findByRole('button', { name: /^Edit$/i }));

    fireEvent.change(screen.getByPlaceholderText('Liquidity Sweep'), {
      target: { value: 'VWAP Reclaim' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Update & activate/i }));

    await waitFor(() => {
      expect(received).toBeDefined();
      expect(received.id).toBe(5);
      expect(received.body).toMatchObject({
        name: 'VWAP Reclaim',
        description: 'Mean reversion setup',
        rulesSetup: 'Wait for VWAP touch',
        tags: ['VWAP'],
        marketTypes: ['Stocks'],
        type: 'Custom',
      });
      expect(screen.getByText('VWAP Reclaim')).toBeInTheDocument();
    });
  });

  it('shows the update API error and keeps the existing strategy unchanged', async () => {
    server.use(
      http.put(`${API_BASE}/strategies/:strategyId`, () =>
        HttpResponse.json({ message: 'Strategy update rejected' }, { status: 400 })
      )
    );

    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    fireEvent.click(screen.getByRole('button', { name: /Open playbook/i }));
    fireEvent.click(await screen.findByRole('button', { name: /^Edit$/i }));
    fireEvent.change(screen.getByPlaceholderText('Liquidity Sweep'), {
      target: { value: 'Changed name' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Update & activate/i }));

    expect(await screen.findByText('Strategy update rejected')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Changed name')).toBeInTheDocument();
    expect(screen.getByText('VWAP Bounce')).toBeInTheDocument();
  });


  it('does not send a delete request when confirmation is cancelled', async () => {
    let deleteCalls = 0;
    server.use(
      http.get(`${API_BASE}/strategies/:strategyId/trades`, () => HttpResponse.json([])),
      http.delete(`${API_BASE}/strategies/:strategyId`, () => {
        deleteCalls += 1;
        return new HttpResponse(null, { status: 204 });
      })
    );
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    fireEvent.click(screen.getByRole('button', { name: /Open playbook/i }));
    const deleteButton = await screen.findByRole('button', { name: /^Delete$/i });
    await waitFor(() => expect(deleteButton).toBeEnabled());
    fireEvent.click(deleteButton);

    expect(confirm).toHaveBeenCalledOnce();
    expect(deleteCalls).toBe(0);
    expect(screen.getByText('VWAP Bounce')).toBeInTheDocument();
    confirm.mockRestore();
  });

  it('deletes a strategy after confirmation and removes it from the workspace', async () => {
    let deleteCalls = 0;
    server.use(
      http.get(`${API_BASE}/strategies/:strategyId/trades`, () => HttpResponse.json([])),
      http.delete(`${API_BASE}/strategies/:strategyId`, () => {
        deleteCalls += 1;
        return new HttpResponse(null, { status: 204 });
      })
    );
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    fireEvent.click(screen.getByRole('button', { name: /Open playbook/i }));
    const deleteButton = await screen.findByRole('button', { name: /^Delete$/i });
    await waitFor(() => expect(deleteButton).toBeEnabled());
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteCalls).toBe(1);
      expect(screen.queryByRole('button', { name: /Open playbook/i })).not.toBeInTheDocument();
    });
    confirm.mockRestore();
  });

  it('keeps the strategy when the delete API fails', async () => {
    server.use(
      http.get(`${API_BASE}/strategies/:strategyId/trades`, () => HttpResponse.json([])),
      http.delete(`${API_BASE}/strategies/:strategyId`, () =>
        HttpResponse.json({ message: 'Strategy deletion rejected' }, { status: 409 })
      )
    );
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    fireEvent.click(screen.getByRole('button', { name: /Open playbook/i }));
    const deleteButton = await screen.findByRole('button', { name: /^Delete$/i });
    await waitFor(() => expect(deleteButton).toBeEnabled());
    fireEvent.click(deleteButton);

    expect(await screen.findByRole('alert')).toHaveTextContent('Strategy deletion rejected');
    expect(screen.getByText('VWAP Bounce')).toBeInTheDocument();
    confirm.mockRestore();
  });

  it('blocks deletion when the strategy has linked trades', async () => {
    let deleteCalls = 0;
    server.use(
      http.get(`${API_BASE}/strategies/:strategyId/trades`, () =>
        HttpResponse.json([{
          id: 'trade-1',
          entryDate: '2026-11-08T10:00:00',
          symbol: 'NIFTY',
          direction: 'LONG',
          currency: 'INR',
          entryPrice: 24000,
          positionSize: 1,
          marketId: 10,
          strategyId: 5,
          strategyUsed: 'VWAP Bounce',
          marketName: 'Acct',
          status: 'OPEN',
        }])
      ),
      http.delete(`${API_BASE}/strategies/:strategyId`, () => {
        deleteCalls += 1;
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    fireEvent.click(screen.getByRole('button', { name: /Open playbook/i }));

    const deleteButton = await screen.findByRole('button', { name: /^Delete$/i });
    await waitFor(() => expect(deleteButton).toBeDisabled());
    expect(screen.getByText(/1 linked trade/i)).toBeInTheDocument();
    expect(deleteCalls).toBe(0);
  });

  it('keeps deletion disabled if linked trades cannot be verified', async () => {
    server.use(
      http.get(`${API_BASE}/strategies/:strategyId/trades`, () =>
        HttpResponse.json({ message: 'Trade lookup unavailable' }, { status: 503 })
      )
    );

    renderWithProviders(<StrategiesView />, { preloadedState: preloaded() });
    fireEvent.click(screen.getByRole('button', { name: /Open playbook/i }));

    const deleteButton = await screen.findByRole('button', { name: /^Delete$/i });
    await waitFor(() => expect(deleteButton).toBeDisabled());
    expect(screen.getByText(/Deletion is disabled until they can be loaded/i)).toBeInTheDocument();
  });
});