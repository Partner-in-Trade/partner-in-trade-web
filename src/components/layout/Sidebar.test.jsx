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

  it('navigates to news calendar tab', async () => {
    const user = userEvent.setup();
    const onTab = vi.fn();
    renderWithProviders(<Sidebar activeTab="dashboard" setActiveTab={onTab} />, {
      preloadedState: {
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
    expect(screen.getByRole('button', { name: /Log Manual Trade/i })).toBeDisabled();
  });

  it('logout clears auth state', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<Sidebar activeTab="dashboard" setActiveTab={() => {}} />, {
      preloadedState: {
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
