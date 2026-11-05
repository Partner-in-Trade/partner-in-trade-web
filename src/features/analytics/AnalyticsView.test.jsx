import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { AnalyticsView } from './AnalyticsView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { apiTradeToUi } from '@/lib/mappers/tradeMapper';
import { mockApiTrade } from '@/test/fixtures';

describe('AnalyticsView', () => {
  it('shows trade count in description', () => {
    renderWithProviders(<AnalyticsView />, {
      preloadedState: {
        trades: {
          rawTrades: [apiTradeToUi(mockApiTrade), apiTradeToUi({ ...mockApiTrade, id: 101 })],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: false,
          prefillDate: null,
          selectedTrade: null,
        },
        analytics: {
          data: {
            marketId: 10,
            closedTradesCount: 2,
            strategyBreakdown: [],
            currency: 'USD',
            totalNetPnl: 250,
            winRate: 50,
          },
          loading: false,
          error: null,
          marketId: 10,
        },
        workspace: {
          markets: [{ id: 10, name: 'Test', currency: 'USD', funds: 1000 }],
          selectedMarketId: 10,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
      },
    });
    expect(screen.getByText(/2 closed trades/i)).toBeInTheDocument();
    expect(screen.getAllByText('Win Rate').length).toBeGreaterThan(0);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('$250.00')).toBeInTheDocument();
  });
});
