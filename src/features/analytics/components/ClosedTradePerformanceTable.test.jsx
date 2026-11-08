import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ClosedTradePerformanceTable } from './ClosedTradePerformanceTable';
import { renderWithProviders } from '@/test/renderWithProviders';

const baseState = {
  analytics: {
    data: {
      marketId: 10,
      currency: 'USD',
      tradePerformance: [
        { tradeId: '1', date: '2026-11-01', symbol: 'BTCUSDT', netPnl: 125.5, rMultiple: 2.5, outcome: 'WIN' },
        { tradeId: '2', date: '2026-11-02', symbol: 'ETHUSDT', netPnl: -40, rMultiple: -1, outcome: 'LOSS' },
        { tradeId: '3', date: '2026-11-03', symbol: 'SOLUSDT', netPnl: 0, rMultiple: null, outcome: 'BREAKEVEN' },
      ],
    },
    loading: false,
    error: null,
    marketId: 10,
  },
};

describe('ClosedTradePerformanceTable', () => {
  it('renders backend outcomes, P&L and missing R-multiple safely', () => {
    renderWithProviders(<ClosedTradePerformanceTable />, { preloadedState: baseState });

    expect(screen.getByText('WIN')).toBeInTheDocument();
    expect(screen.getByText('LOSS')).toBeInTheDocument();
    expect(screen.getByText('BREAKEVEN')).toBeInTheDocument();
    expect(screen.getByText('$125.50')).toBeInTheDocument();
    expect(screen.getByText('$-40.00')).toBeInTheDocument();
    expect(screen.getByText('2.50R')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('shows an empty state when no closed trades are available', () => {
    renderWithProviders(<ClosedTradePerformanceTable />, {
      preloadedState: {
        ...baseState,
        analytics: { ...baseState.analytics, data: { ...baseState.analytics.data, tradePerformance: [] } },
      },
    });

    expect(screen.getByText('No closed trades to analyze yet.')).toBeInTheDocument();
  });
});
