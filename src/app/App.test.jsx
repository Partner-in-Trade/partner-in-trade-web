import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import App, { MainContent } from './App';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser, mockEconomicEvents } from '@/test/fixtures';
import * as newsDayTimeline from '@/features/news/utils/newsDayTimeline';

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
    expect(screen.getByRole('img', { name: 'Partner in Trade logo' })).toBeInTheDocument();
    expect(screen.getByText('Performance Overview')).toBeInTheDocument();
  });
});

describe('MainContent', () => {
  beforeEach(() => {
    vi.spyOn(newsDayTimeline, 'getTodayIsoInNewsTz').mockReturnValue('2026-10-20');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders AnalyticsView without waiting for journal bootstrap', () => {
    renderWithProviders(
      <MainContent activeTab="analytics" onNavigate={() => {}} />,
      {
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
      }
    );
    expect(screen.getByText('Partner in Trade Analytics')).toBeInTheDocument();
    expect(screen.queryByText(/Loading your journal/)).not.toBeInTheDocument();
  });

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

  it('skips journal loading on news calendar tab', () => {
    renderWithProviders(<MainContent activeTab="news-calendar" onNavigate={() => {}} />, {
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
        news: {
          events: mockEconomicEvents,
          loading: false,
          error: null,
          fetchedAt: 1,
        },
      },
    });
    expect(screen.queryByText(/Loading your journal/)).not.toBeInTheDocument();
    expect(screen.getByText(/Rest of the week/i)).toBeInTheDocument();
  });

  it('skips journal error on news calendar tab', () => {
    renderWithProviders(<MainContent activeTab="news-calendar" onNavigate={() => {}} />, {
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
        news: {
          events: mockEconomicEvents,
          loading: false,
          error: null,
          fetchedAt: 1,
        },
      },
    });
    expect(screen.queryByText('Bootstrap failed')).not.toBeInTheDocument();
    expect(screen.getByText(/Rest of the week/i)).toBeInTheDocument();
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
