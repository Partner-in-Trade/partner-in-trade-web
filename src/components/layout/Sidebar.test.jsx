import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser } from '@/test/fixtures';

describe('Sidebar', () => {
  it('navigates via setActiveTab callback', async () => {
    const user = userEvent.setup();
    const onTab = vi.fn();
    renderWithProviders(<Sidebar activeTab="dashboard" setActiveTab={onTab} />, {
      preloadedState: {
        subscription: {
          me: { planCode: 'TRIAL', effectivePlanCode: 'TRIAL' },
          entitlements: { effectivePlanCode: 'TRIAL', capabilities: ['DASHBOARD', 'ANALYTICS', 'PNL_CALENDAR', 'JOURNAL', 'JOURNAL_MEDIA', 'TRADE_LOG', 'STRATEGIES', 'MARKETS', 'NEWS_CALENDAR'] },
          status: 'ready',
        },
        auth: { user: mockUser, authError: null, authLoading: false },
        workspace: {
          markets: [{ id: 10, name: 'Forex' }],
          selectedMarketId: 10,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
      },
    });
    await user.click(screen.getByRole('button', { name: /Markets/i }));
    expect(onTab).toHaveBeenCalledWith('markets');
  });

  it('navigates to analytics tab', async () => {
    const user = userEvent.setup();
    const onTab = vi.fn();
    renderWithProviders(<Sidebar activeTab="dashboard" setActiveTab={onTab} />, {
      preloadedState: {
        subscription: {
          me: { planCode: 'TRIAL', effectivePlanCode: 'TRIAL' },
          entitlements: { effectivePlanCode: 'TRIAL', capabilities: ['DASHBOARD', 'ANALYTICS', 'PNL_CALENDAR', 'JOURNAL', 'JOURNAL_MEDIA', 'TRADE_LOG', 'STRATEGIES', 'MARKETS', 'NEWS_CALENDAR'] },
          status: 'ready',
        },
        auth: { user: mockUser, authError: null, authLoading: false },
        workspace: {
          markets: [{ id: 10, name: 'Forex' }],
          selectedMarketId: 10,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
      },
    });
    await user.click(screen.getByRole('button', { name: /Analytics/i }));
    expect(onTab).toHaveBeenCalledWith('analytics');
  });

  it('navigates to news calendar tab', async () => {
    const user = userEvent.setup();
    const onTab = vi.fn();
    renderWithProviders(<Sidebar activeTab="dashboard" setActiveTab={onTab} />, {
      preloadedState: {
        subscription: {
          me: { planCode: 'TRIAL', effectivePlanCode: 'TRIAL' },
          entitlements: { effectivePlanCode: 'TRIAL', capabilities: ['DASHBOARD', 'ANALYTICS', 'PNL_CALENDAR', 'JOURNAL', 'JOURNAL_MEDIA', 'TRADE_LOG', 'STRATEGIES', 'MARKETS', 'NEWS_CALENDAR'] },
          status: 'ready',
        },
        auth: { user: mockUser, authError: null, authLoading: false },
        workspace: {
          markets: [{ id: 10, name: 'Forex' }],
          selectedMarketId: 10,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
      },
    });
    await user.click(screen.getByRole('button', { name: /News Calendar/i }));
    expect(onTab).toHaveBeenCalledWith('news-calendar');
  });

  it('disables log trade without selected market', () => {
    renderWithProviders(<Sidebar activeTab="dashboard" setActiveTab={() => {}} />, {
      preloadedState: {
        subscription: {
          me: { planCode: 'TRIAL', effectivePlanCode: 'TRIAL' },
          entitlements: { effectivePlanCode: 'TRIAL', capabilities: ['DASHBOARD', 'ANALYTICS', 'PNL_CALENDAR', 'JOURNAL', 'JOURNAL_MEDIA', 'TRADE_LOG', 'STRATEGIES', 'MARKETS', 'NEWS_CALENDAR'] },
          status: 'ready',
        },
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
    expect(screen.getByRole('button', { name: /Log Trade/i })).toBeDisabled();
  });

  it('journal sidebar calendar day switches to day view', async () => {
    const user = userEvent.setup();
    const onTab = vi.fn();
    const { store } = renderWithProviders(
      <Sidebar activeTab="journal" setActiveTab={onTab} />,
      {
        preloadedState: {
          subscription: {
          me: { planCode: 'TRIAL', effectivePlanCode: 'TRIAL' },
          entitlements: { effectivePlanCode: 'TRIAL', capabilities: ['DASHBOARD', 'ANALYTICS', 'PNL_CALENDAR', 'JOURNAL', 'JOURNAL_MEDIA', 'TRADE_LOG', 'STRATEGIES', 'MARKETS', 'NEWS_CALENDAR'] },
          status: 'ready',
        },
        auth: { user: mockUser, authError: null, authLoading: false },
          workspace: {
            markets: [{ id: 10, name: 'Forex' }],
            selectedMarketId: 10,
            strategiesByName: {},
            workspaceLoading: false,
            workspaceError: null,
          },
          journal: {
            summariesByDate: {},
            dailyByDate: {},
            dailyLoading: false,
            dailySaving: false,
            dailyError: null,
            selectedDate: '2025-05-01',
            mainView: 'write',
            journalNavExpanded: true,
          },
        },
      }
    );

    await user.click(screen.getByRole('button', { name: '12' }));
    expect(store.getState().journal.mainView).toBe('day');
    expect(store.getState().journal.selectedDate).toBe('2025-05-12');
  });


  it('shows only features included in the effective plan capabilities', () => {
    renderWithProviders(<Sidebar activeTab="dashboard" setActiveTab={() => {}} />, {
      preloadedState: {
        auth: { user: mockUser, authError: null, authLoading: false },
        subscription: {
          me: { planCode: 'BASIC', effectivePlanCode: 'BASIC' },
          entitlements: {
            effectivePlanCode: 'BASIC',
            capabilities: ['DASHBOARD', 'ANALYTICS', 'JOURNAL', 'JOURNAL_MEDIA', 'TRADE_LOG', 'STRATEGIES', 'MARKETS'],
          },
          status: 'ready',
        },
        workspace: {
          markets: [{ id: 10, name: 'Forex' }],
          selectedMarketId: 10,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
      },
    });

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Journal' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'P&L Calendar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'News Calendar' })).not.toBeInTheDocument();
  });

  it('logout clears auth state', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<Sidebar activeTab="dashboard" setActiveTab={() => {}} />, {
      preloadedState: {
        subscription: {
          me: { planCode: 'TRIAL', effectivePlanCode: 'TRIAL' },
          entitlements: { effectivePlanCode: 'TRIAL', capabilities: ['DASHBOARD', 'ANALYTICS', 'PNL_CALENDAR', 'JOURNAL', 'JOURNAL_MEDIA', 'TRADE_LOG', 'STRATEGIES', 'MARKETS', 'NEWS_CALENDAR'] },
          status: 'ready',
        },
        auth: { user: mockUser, authError: null, authLoading: false },
        workspace: {
          markets: [{ id: 10, name: 'Forex' }],
          selectedMarketId: 10,
          strategiesByName: {},
          workspaceLoading: false,
          workspaceError: null,
        },
      },
    });
    await user.click(screen.getByRole('button', { name: /Sign Out/i }));
    expect(store.getState().auth.user).toBeNull();
  });
});
