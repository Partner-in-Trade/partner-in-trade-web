import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createTestStore } from '@/test/renderWithProviders';
import { fetchThisWeekNews } from './newsSlice';
import { logout } from './authSlice';
import { mockUser, mockEconomicEvents } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { API_BASE } from '@/test/msw/handlers';

describe('newsSlice', () => {
  it('fetchThisWeekNews loads events and sets fetchedAt', async () => {
    const store = createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
    });
    const result = await store.dispatch(fetchThisWeekNews());
    expect(result.type).toBe(fetchThisWeekNews.fulfilled.type);

    const { news } = store.getState();
    expect(news.loading).toBe(false);
    expect(news.events).toHaveLength(mockEconomicEvents.length);
    expect(news.events[0].eventName).toBe('CPI m/m');
    expect(news.fetchedAt).toBeTruthy();
    expect(news.error).toBeNull();
  });

  it('fetchThisWeekNews does not call API when already fetched', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${API_BASE}/news/this-week`, () => {
        requestCount += 1;
        return HttpResponse.json(mockEconomicEvents);
      })
    );

    const store = createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
      news: {
        events: mockEconomicEvents,
        loading: false,
        error: null,
        fetchedAt: Date.now(),
      },
    });

    await store.dispatch(fetchThisWeekNews());
    expect(requestCount).toBe(0);
    expect(store.getState().news.events).toHaveLength(mockEconomicEvents.length);
  });

  it('fetchThisWeekNews does not call API while a request is in flight', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${API_BASE}/news/this-week`, () => {
        requestCount += 1;
        return HttpResponse.json(mockEconomicEvents);
      })
    );

    const store = createTestStore({
      news: {
        events: [],
        loading: true,
        error: null,
        fetchedAt: null,
      },
    });

    await store.dispatch(fetchThisWeekNews());
    expect(requestCount).toBe(0);
  });

  it('fetchThisWeekNews runs only once across repeated dispatches', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${API_BASE}/news/this-week`, () => {
        requestCount += 1;
        return HttpResponse.json(mockEconomicEvents);
      })
    );

    const store = createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
    });

    await store.dispatch(fetchThisWeekNews());
    await store.dispatch(fetchThisWeekNews());
    expect(requestCount).toBe(1);
    expect(store.getState().news.fetchedAt).toBeTruthy();
  });

  it('fetchThisWeekNews records error on failure', async () => {
    server.use(
      http.get(`${API_BASE}/news/this-week`, () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );

    const store = createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
    });
    await store.dispatch(fetchThisWeekNews());

    const { news } = store.getState();
    expect(news.loading).toBe(false);
    expect(news.events).toEqual([]);
    expect(news.error).toBeTruthy();
    expect(news.fetchedAt).toBeNull();
  });

  it('logout resets news slice', () => {
    const store = createTestStore({
      auth: { user: mockUser, authError: null, authLoading: false },
      news: {
        events: [{ id: 'x' }],
        loading: true,
        error: 'e',
        fetchedAt: 1,
      },
    });
    store.dispatch(logout());
    expect(store.getState().news.events).toEqual([]);
    expect(store.getState().news.loading).toBe(false);
    expect(store.getState().news.fetchedAt).toBeNull();
  });
});
