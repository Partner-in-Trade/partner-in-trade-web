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
    expect(ui.entryDate).toBe('2025-05-01');
    expect(ui.exitDate).toBe('2025-05-01');
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
    expect(payload.entryDate).toBe('2025-05-01T09:35:00');
    expect(payload.exitDate).toBe('2025-05-01T10:05:00');
    expect(payload.timeframe).toBe('5m');
    expect(payload.contractMultiplier).toBe(1);
  });

  it('uiTradeToApi forwards a custom contract multiplier', () => {
    const payload = uiTradeToApi({ ...mockUiTrade, contractMultiplier: 10 }, {
      userId: 1,
      marketId: 10,
      marketName: 'Futures',
      strategyId: 5,
    });
    expect(payload.contractMultiplier).toBe(10);
  });

  it('apiTradeToUi defaults missing contract multiplier to one', () => {
    expect(apiTradeToUi({ ...mockApiTrade, contractMultiplier: null }).contractMultiplier).toBe(1);
  });

  it('uiTradeToApi uses separate exit date when provided', () => {
    const payload = uiTradeToApi(
      {
        ...mockUiTrade,
        entryDate: '2025-05-01',
        exitDate: '2025-05-02',
        exitTime: '11:00',
      },
      {
        userId: 1,
        marketId: 10,
        marketName: 'Forex',
        strategyId: 5,
      }
    );
    expect(payload.entryDate).toBe('2025-05-01T09:35:00');
    expect(payload.exitDate).toBe('2025-05-02T11:00:00');
  });

  it('uiTradeToApi uses custom timeframe when provided', () => {
    const payload = uiTradeToApi({ ...mockUiTrade, timeframe: '15m' }, {
      userId: 1,
      marketId: 10,
      marketName: 'Forex',
      strategyId: 5,
    });
    expect(payload.timeframe).toBe('15m');
  });

  it('resolveStrategyId prefers setup name then falls back', () => {
    const map = { 'VWAP Bounce': 5, 'Gap & Go': 6 };
    expect(resolveStrategyId(map, 'VWAP Bounce')).toBe(5);
    expect(resolveStrategyId(map, 'Unknown')).toBe(5);
    expect(resolveStrategyId({}, 'x')).toBeNull();
  });
});
