import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { NewsCalendarView } from './NewsCalendarView';
import { renderWithProviders } from '@/test/renderWithProviders';
import { mockUser, mockEconomicEvents, mockNewsState } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { API_BASE } from '@/test/msw/handlers';
import * as newsDayTimeline from '@/features/news/utils/newsDayTimeline';

const authState = {
  auth: { user: mockUser, authError: null, authLoading: false },
};

const MOCK_TODAY = '2026-10-20';

describe('NewsCalendarView', () => {
  beforeEach(() => {
    vi.spyOn(newsDayTimeline, 'getTodayIsoInNewsTz').mockReturnValue(MOCK_TODAY);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches once on first visit and renders timeline with cluster', async () => {
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
    expect(screen.getByText('Non-Farm Payrolls')).toBeInTheDocument();
    expect(screen.getByText(/Tuesday, October 20/i)).toBeInTheDocument();
    expect(screen.getByText(/Key window · 2 releases/i)).toBeInTheDocument();
    expect(screen.getByText(/Rest of the week/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add journal note/i })).toBeInTheDocument();
    expect(screen.getByText('Today at a glance')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Refresh/i })).not.toBeInTheDocument();
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
      eventDate: MOCK_TODAY,
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

  it('switches timeline when a rest-of-week day is selected', async () => {
    server.use(
      http.get(`${API_BASE}/news/this-week`, () => HttpResponse.json(mockEconomicEvents))
    );
    const user = userEvent.setup();
    renderWithProviders(<NewsCalendarView />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText('CPI m/m')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Wed.*October 21/i }));
    await waitFor(() => {
      expect(screen.getByText('ECB Rate Decision')).toBeInTheDocument();
    });
    expect(screen.queryByText('Non-Farm Payrolls')).not.toBeInTheDocument();
    expect(screen.getByText(/Wednesday, October 21/i)).toBeInTheDocument();
  });

  it('filters events by impact', async () => {
    server.use(
      http.get(`${API_BASE}/news/this-week`, () => HttpResponse.json(mockEconomicEvents))
    );
    const user = userEvent.setup();
    renderWithProviders(<NewsCalendarView />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText('CPI m/m')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Medium' }));
    expect(screen.queryByText('CPI m/m')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'High' }));
    expect(screen.getByText('CPI m/m')).toBeInTheDocument();
    expect(screen.queryByText('ECB Rate Decision')).not.toBeInTheDocument();
  });

  it('navigates to journal write when Add journal note is clicked', async () => {
    server.use(
      http.get(`${API_BASE}/news/this-week`, () => HttpResponse.json(mockEconomicEvents))
    );
    const user = userEvent.setup();
    const { store } = renderWithProviders(<NewsCalendarView />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add journal note/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Add journal note/i }));

    expect(store.getState().journal.mainView).toBe('write');
    expect(store.getState().journal.selectedDate).toBe(MOCK_TODAY);
    expect(store.getState().ui.activeTab).toBe('journal');
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
