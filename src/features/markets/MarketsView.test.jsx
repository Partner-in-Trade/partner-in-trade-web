import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { MarketsView } from './MarketsView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockMarkets, mockUser } from '@/test/fixtures';

describe('MarketsView', () => {
  it('shows empty state when no markets', () => {
    renderWithProviders(<MarketsView />, {
      preloadedState: {
        workspace: {
          markets: [],
          selectedMarketId: null,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
      },
    });
    expect(screen.getByText(/No markets yet/i)).toBeInTheDocument();
  });

  it('validates create form funds', () => {
    renderWithProviders(<MarketsView />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
        workspace: {
          markets: [],
          selectedMarketId: null,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
      },
    });
    fireEvent.submit(screen.getByRole('button', { name: /Create market/i }).closest('form'));
    expect(screen.getByText(/Initial capital must be a positive number/i)).toBeInTheDocument();
  });

  it('lists markets from store', () => {
    renderWithProviders(<MarketsView />, {
      preloadedState: {
        workspace: {
          markets: mockMarkets,
          selectedMarketId: 10,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
      },
    });
    expect(screen.getAllByText('Forex').length).toBeGreaterThan(0);
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });
});
