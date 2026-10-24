export const mockUser = {
  id: '1',
  fullName: 'Test User',
  email: 'test@example.com',
  accountType: 'LIVE PRO',
  baseCurrency: 'USD',
};

export const mockMarkets = [
  {
    id: 10,
    name: 'Forex',
    currency: 'USD',
    funds: 10000,
    marketActivated: true,
    numberOfTrades: 2,
    winRate: 50,
  },
  {
    id: 11,
    name: 'Stocks',
    currency: 'USD',
    funds: 5000,
    marketActivated: true,
    numberOfTrades: 0,
    winRate: null,
  },
];

export const mockApiTrade = {
  id: 100,
  symbol: 'AAPL',
  direction: 'LONG',
  currency: 'USD',
  entryDate: '2025-05-01T09:35:00',
  exitDate: '2025-05-01T10:05:00',
  entryPrice: 100,
  exitPrice: 110,
  positionSize: 10,
  stopLoss: 95,
  status: 'CLOSED',
  strategyUsed: 'VWAP Bounce',
  notes: 'Test note',
  emotion: 'Focused',
};

export const mockUiTrade = {
  id: '100',
  date: '2025-05-01',
  entryTime: '09:35',
  exitTime: '10:05',
  symbol: 'AAPL',
  assetClass: 'Stocks',
  currency: 'USD',
  direction: 'LONG',
  quantity: 10,
  entryPrice: 100,
  exitPrice: 110,
  stopLoss: 95,
  takeProfit: '',
  fees: 0,
  setup: 'VWAP Bounce',
  mistake: 'None',
  notes: 'Test note',
  emotion: 'Focused',
  rating: 3,
};

export function loginSuccessResponse(email = 'test@example.com') {
  return {
    success: true,
    accessToken: 'jwt-test-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: { id: 1, name: 'Test User', email },
  };
}

export function strategiesListResponse(strategies = [{ id: 5, name: 'VWAP Bounce' }]) {
  return { strategies, totalElements: strategies.length };
}

export const mockEconomicEvents = [
  {
    id: 'evt-1',
    eventUid: 'uid-1',
    eventDate: '2026-10-20',
    eventTime: '18:30:00',
    currency: 'USD',
    country: 'US',
    eventName: 'CPI m/m',
    impact: 'HIGH',
    forecast: '0.3%',
    previous: '0.2%',
    actual: null,
  },
  {
    id: 'evt-2',
    eventUid: 'uid-2',
    eventDate: '2026-10-21',
    eventTime: '14:00:00',
    currency: 'EUR',
    country: 'EU',
    eventName: 'ECB Rate Decision',
    impact: 'MEDIUM',
    forecast: '4.0%',
    previous: '4.0%',
    actual: null,
  },
];

export function mockNewsState(overrides = {}) {
  return {
    events: [],
    loading: false,
    error: null,
    fetchedAt: null,
    ...overrides,
  };
}
