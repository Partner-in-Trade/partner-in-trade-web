import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardView } from './DashboardView';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('DashboardView', () => {
  it('prompts to add first market when empty', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderWithProviders(<DashboardView onNavigate={onNavigate} />, {
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
    await user.click(screen.getByRole('button', { name: /Add your first market/i }));
    expect(onNavigate).toHaveBeenCalledWith('markets');
  });
});
