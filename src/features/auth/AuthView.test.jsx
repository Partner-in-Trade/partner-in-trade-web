import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthView } from './AuthView';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('AuthView', () => {
  it('renders auth error from store', () => {
    renderWithProviders(<AuthView />, {
      preloadedState: {
        auth: { user: null, authError: 'Invalid email or password', authLoading: false },
      },
    });
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('submits login form', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<AuthView />);
    await user.type(screen.getByPlaceholderText('trader@partnerintrade.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••••••'), 'secret');
    await user.click(screen.getByRole('button', { name: /Sign In to Dashboard/i }));
    await waitFor(() => {
      expect(store.getState().auth.user?.email).toBe('test@example.com');
    });
  });
});
