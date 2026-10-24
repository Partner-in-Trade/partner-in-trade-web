import { describe, it, expect } from 'vitest';
import {
  apiTradeToUi,
  uiTradeToApi,
  resolveStrategyId,
} from './tradeMapper';
import { mockApiTrade, mockUiTrade } from '@/test/fixtures';

describe('tradeMapper', () => {
  it('apiTradeToUi maps API trade to UI shape', () => {
    const ui = apiTradeToUi(mockApiTrade);
    expect(ui.symbol).toBe('AAPL');
    expect(ui.date).toBe('2025-05-01');
    expect(ui.entryTime).toBe('09:35');
    expect(ui.setup).toBe('VWAP Bounce');
  });

  it('uiTradeToApi maps UI trade for create payload', () => {
    const payload = uiTradeToApi(mockUiTrade, {
      userId: 1,
      marketId: 10,
      marketName: 'Forex',
      strategyId: 5,
    });
    expect(payload.symbol).toBe('AAPL');
    expect(payload.marketId).toBe(10);
    expect(payload.strategyId).toBe(5);
    expect(payload.status).toBe('CLOSED');
    expect(payload.exitPrice).toBe(110);
  });

  it('resolveStrategyId prefers setup name then falls back', () => {
    const map = { 'VWAP Bounce': 5, 'Gap & Go': 6 };
    expect(resolveStrategyId(map, 'VWAP Bounce')).toBe(5);
    expect(resolveStrategyId(map, 'Unknown')).toBe(5);
    expect(resolveStrategyId({}, 'x')).toBeNull();
  });
});
