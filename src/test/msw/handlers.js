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
    return HttpResponse.json({ id: 99, name: body.name });
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

  http.get(`${API_BASE}/strategies/user/:userId`, () =>
    HttpResponse.json(strategiesListResponse())
  ),

  http.post(`${API_BASE}/strategies/add`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 42, name: body.name, ...body });
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
];
