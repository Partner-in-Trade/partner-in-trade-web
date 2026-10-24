import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { NewsCalendarView } from './NewsCalendarView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser, mockEconomicEvents, mockNewsState } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { API_BASE } from '@/test/msw/handlers';

const authState = {
  auth: { user: mockUser, authError: null, authLoading: false },
};

describe('NewsCalendarView', () => {
  it('fetches once on first visit and renders grouped events', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${API_BASE}/news/this-week`, () => {
        requestCount += 1;
        return HttpResponse.json(mockEconomicEvents);
      })
    );

    renderWithProviders(<NewsCalendarView />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText('CPI m/m')).toBeInTheDocument();
    });

    expect(requestCount).toBe(1);
    expect(screen.getByText('ECB Rate Decision')).toBeInTheDocument();
    expect(screen.getByText(/Tuesday · Oct 20, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Wednesday · Oct 21, 2026/i)).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Med')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Refresh/i })).not.toBeInTheDocument();
    expect(screen.getByText(/This week's economic events/i)).toBeInTheDocument();
  });

  it('shows loading state before first fetch completes', () => {
    renderWithProviders(<NewsCalendarView />, { preloadedState: authState });
    expect(screen.getByText(/Loading calendar/i)).toBeInTheDocument();
  });

  it('does not refetch when revisiting with cached data', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${API_BASE}/news/this-week`, () => {
        requestCount += 1;
        return HttpResponse.json(mockEconomicEvents);
      })
    );

    const cachedEvent = {
      id: 'cached',
      eventDate: '2026-10-20',
      eventTime: '10:00:00',
      currency: 'GBP',
      country: 'UK',
      eventName: 'Cached Event',
      impact: 'LOW',
      forecast: null,
      previous: null,
      actual: null,
    };

    const newsLoaded = mockNewsState({
      events: [cachedEvent],
      fetchedAt: Date.now(),
    });

    const { unmount } = renderWithProviders(<NewsCalendarView />, {
      preloadedState: { ...authState, news: newsLoaded },
    });

    expect(screen.getByText('Cached Event')).toBeInTheDocument();
    expect(requestCount).toBe(0);

    unmount();
    renderWithProviders(<NewsCalendarView />, {
      preloadedState: { ...authState, news: newsLoaded },
    });
    expect(screen.getByText('Cached Event')).toBeInTheDocument();
    expect(requestCount).toBe(0);
  });

  it('shows empty state when API returns no events', async () => {
    server.use(
      http.get(`${API_BASE}/news/this-week`, () => HttpResponse.json([]))
    );
    renderWithProviders(<NewsCalendarView />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText(/No economic events scheduled this week/i)).toBeInTheDocument();
    });
  });

  it('shows API error without a refresh control', async () => {
    server.use(
      http.get(`${API_BASE}/news/this-week`, () =>
        HttpResponse.json({ message: 'Unavailable' }, { status: 503 })
      )
    );
    renderWithProviders(<NewsCalendarView />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText(/Unavailable|Failed to load news calendar/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Refresh/i })).not.toBeInTheDocument();
  });
});
