import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileView } from './ProfileView';
import { authApi } from '@/features/auth/api/authApi';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/features/auth/api/authApi', () => ({
  authApi: {
    getCurrentProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

const existingUser = {
  id: '42',
  fullName: 'Test Trader',
  name: 'Test Trader',
  email: 'trader@example.com',
  username: 'testtrader',
  bio: 'Intraday trader',
  location: 'Bengaluru',
  markets: 'Options, Stocks',
  tradingMarkets: 'Options, Stocks',
  tradingExperience: '1 to 2 years',
  tradingStyle: 'Intraday',
  usualSessionStart: '09:15',
  usualSessionEnd: '15:30',
  riskPerTrade: 1,
  baseCurrency: 'INR',
  timezone: 'Asia/Kolkata',
};

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authApi.getCurrentProfile.mockResolvedValue({
      data: { ...existingUser, id: 42, name: 'Test Trader' },
    });
    authApi.updateProfile.mockResolvedValue({
      data: { ...existingUser, id: 42, name: 'Updated Trader' },
    });
  });

  it('loads and displays the authenticated user profile', async () => {
    renderWithProviders(<ProfileView />, {
      preloadedState: { auth: { user: existingUser, authError: null, authLoading: false } },
    });

    expect(await screen.findByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(await screen.findByText('Test Trader')).toBeInTheDocument();
    expect(authApi.getCurrentProfile).toHaveBeenCalledTimes(1);
  });

  it('submits edited profile fields and shows the success state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileView mode="settings" />, {
      preloadedState: { auth: { user: existingUser, authError: null, authLoading: false } },
    });

    const nameInput = await screen.findByLabelText('Full name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Trader');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(authApi.updateProfile).toHaveBeenCalledTimes(1);
    });
    expect(authApi.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Trader',
        email: 'trader@example.com',
        username: 'testtrader',
        accountCurrency: 'INR',
        timeZone: 'Asia/Kolkata',
      })
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Profile saved successfully.');
  });

  it('shows the API validation message when the profile update is rejected', async () => {
    const user = userEvent.setup();
    authApi.updateProfile.mockRejectedValue({
      response: { data: { message: 'Username is already taken' } },
    });
    renderWithProviders(<ProfileView mode="settings" />, {
      preloadedState: { auth: { user: existingUser, authError: null, authLoading: false } },
    });

    await screen.findByLabelText('Full name');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Username is already taken');
  });
});
