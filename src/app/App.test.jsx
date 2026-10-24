import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App, { MainContent } from './App';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser } from '@/test/fixtures';

describe('App', () => {
  it('shows AuthView when not authenticated', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('Sign In to Dashboard')).toBeInTheDocument();
  });

  it('shows app shell when authenticated', () => {
    renderWithProviders(<App />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
        workspace: {
          markets: [{ id: 10, name: 'Forex', currency: 'USD', funds: 1000 }],
          selectedMarketId: 10,
          strategiesByName: { 'VWAP Bounce': 5 },
          workspaceLoading: false,
          workspaceError: null,
        },
        trades: {
          rawTrades: [],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: false,
          prefillDate: null,
          selectedTrade: null,
        },
      },
    });
    expect(screen.getByText('Partner in Trade')).toBeInTheDocument();
    expect(screen.getByText('Performance Overview')).toBeInTheDocument();
  });
});

describe('MainContent', () => {
  it('shows journal loading state', () => {
    renderWithProviders(<MainContent activeTab="dashboard" onNavigate={() => {}} />, {
      preloadedState: {
        workspace: {
          markets: [],
          selectedMarketId: null,
          strategiesByName: {},
          workspaceLoading: true,
          workspaceError: null,
        },
        trades: {
          rawTrades: [],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: false,
          prefillDate: null,
          selectedTrade: null,
        },
      },
    });
    expect(screen.getByText(/Loading your journal/)).toBeInTheDocument();
  });

  it('shows journal error outside markets tab', () => {
    renderWithProviders(<MainContent activeTab="dashboard" onNavigate={() => {}} />, {
      preloadedState: {
        workspace: {
          markets: [],
          selectedMarketId: null,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: 'Bootstrap failed',
        },
        trades: {
          rawTrades: [],
          tradesLoading: false,
          tradesError: null,
          isAddModalOpen: false,
          prefillDate: null,
          selectedTrade: null,
        },
      },
    });
    expect(screen.getByText('Bootstrap failed')).toBeInTheDocument();
  });
});
