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
      },
    });
    expect(screen.getByText(/2 trades/i)).toBeInTheDocument();
  });
});
