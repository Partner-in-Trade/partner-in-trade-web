import { http, HttpResponse } from 'msw';
import {
  loginSuccessResponse,
  mockApiTrade,
  mockMarkets,
  mockEconomicEvents,
  strategiesListResponse,
} from '../fixtures';

export const API_BASE = 'http://localhost:8080/api/v1';

export const handlers = [
  http.post(`${API_BASE}/users/login`, async ({ request }) => {
    const body = await request.json();
    if (body.password === 'bad') {
      return HttpResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json(loginSuccessResponse(body.email));
  }),

  http.post(`${API_BASE}/users/create`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(loginSuccessResponse(body.email));
  }),

  http.get(`${API_BASE}/markets`, () => HttpResponse.json(mockMarkets)),

  http.post(`${API_BASE}/markets/create`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, name: body.name, type: body.type || null });
  }),

  http.put(`${API_BASE}/markets/:marketId/activate`, ({ params }) =>
    HttpResponse.json({
      id: Number(params.marketId),
      name: 'Forex',
      currency: 'USD',
      funds: 10000,
    })
  ),

  http.put(`${API_BASE}/markets/:marketId/funds`, () => HttpResponse.json({ success: true })),

  http.delete(`${API_BASE}/markets/:marketId`, ({ params }) =>
    HttpResponse.json({
      success: true,
      message: 'Market deleted',
      id: Number(params.marketId),
    })
  ),

  http.get(`${API_BASE}/strategies/user/:userId`, ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const all = strategiesListResponse().strategies;
    const filtered = search
      ? all.filter(
          (s) =>
            s.name.toLowerCase().includes(search) ||
            (s.description || '').toLowerCase().includes(search) ||
            (s.tags || []).some((t) => t.toLowerCase().includes(search))
        )
      : all;
    return HttpResponse.json({
      strategies: filtered,
      pageable: { pageNumber: 0, pageSize: 100, total: filtered.length },
    });
  }),

  http.post(`${API_BASE}/strategies/add`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 42, name: body.name, ...body });
  }),

  http.get(`${API_BASE}/strategies/:strategyId`, ({ params }) => {
    const id = Number(params.strategyId);
    const strategy = strategiesListResponse().strategies.find((s) => s.id === id) || {
      id,
      name: 'Strategy',
      description: '',
      tags: [],
      type: 'Custom',
      timeframe: '15m',
    };
    return HttpResponse.json(strategy);
  }),

  http.get(`${API_BASE}/strategies/:strategyId/trades`, ({ params }) => {
    const strategyId = Number(params.strategyId);
    const trades =
      mockApiTrade.strategyId === strategyId ? [mockApiTrade] : [];
    return HttpResponse.json(trades);
  }),

  http.get(`${API_BASE}/trades/market/:marketId`, () =>
    HttpResponse.json([mockApiTrade])
  ),

  http.post(`${API_BASE}/trades/add`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockApiTrade, id: 101, symbol: body.symbol });
  }),

  http.delete(`${API_BASE}/trades/:tradeId`, () => HttpResponse.json({ success: true })),

  http.get(`${API_BASE}/news/this-week`, () => HttpResponse.json(mockEconomicEvents)),

  http.get(`${API_BASE}/daily-journals`, () => HttpResponse.json([])),

  http.get(`${API_BASE}/daily-journals/:date`, ({ params }) => {
    if (params.date === '2025-05-15') {
      return HttpResponse.json({
        journalDate: '2025-05-15',
        title: 'Disciplined session',
        marketOverview: '<p>Overview</p>',
        whatWentWell: '<p>Win</p>',
        whatToImprove: '<p>Fix</p>',
        screenshotsJson: [],
      });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE}/journal-media`, async () =>
    HttpResponse.json({
      url: 'https://ik.imagekit.io/mock/journals/test.png',
      fileId: 'mock-file-id',
    })
  ),

  http.put(`${API_BASE}/daily-journals/:date`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      journalDate: params.date,
      ...body,
    });
  }),
];
