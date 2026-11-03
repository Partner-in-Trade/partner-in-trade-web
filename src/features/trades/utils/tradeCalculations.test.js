import { describe, it, expect } from 'vitest';
import {
  canCalculateNetPnl,
  enrichTrade,
  computePortfolioMetrics,
} from './tradeCalculations';

const makeTrade = (overrides = {}) =>
  enrichTrade({
    date: '2026-01-01',
    entryTime: '09:00',
    symbol: 'TEST',
    direction: 'LONG',
    quantity: 1,
    entryPrice: 100,
    exitPrice: 110,
    stopLoss: 90,
    fees: 0,
    ...overrides,
  });

describe('tradeCalculations', () => {
  it('canCalculateNetPnl requires entry and exit prices', () => {
    expect(canCalculateNetPnl({ entryPrice: 100, exitPrice: 110 })).toBe(true);
    expect(canCalculateNetPnl({ entryPrice: 100, exitPrice: '' })).toBe(false);
  });

  it('enrichTrade computes LONG net PnL after fees', () => {
    const enriched = makeTrade({ quantity: 10, stopLoss: 95, fees: 5 });
    expect(enriched.netPnl).toBe(95);
    expect(enriched.outcome).toBe('WIN');
    expect(enriched.rMultiple).toBe(2);
  });

  it('enrichTrade computes SHORT net PnL', () => {
    const enriched = makeTrade({
      direction: 'SHORT',
      quantity: 2,
      entryPrice: 50,
      exitPrice: 45,
      stopLoss: 55,
    });
    expect(enriched.netPnl).toBe(10);
    expect(enriched.outcome).toBe('WIN');
  });

  it('marks trades without an exit or PnL override as open', () => {
    const enriched = makeTrade({ exitPrice: '' });
    expect(enriched.isOpen).toBe(true);
    expect(enriched.outcome).toBe('OPEN');
  });

  it('classifies small positive and negative net PnL without a currency threshold', () => {
    expect(makeTrade({ entryPrice: 100, exitPrice: 101 }).outcome).toBe('WIN');
    expect(makeTrade({ entryPrice: 100, exitPrice: 99 }).outcome).toBe('LOSS');
  });

  it('classifies exactly zero net PnL as breakeven', () => {
    const enriched = makeTrade({ entryPrice: 100, exitPrice: 100 });
    expect(enriched.netPnl).toBe(0);
    expect(enriched.outcome).toBe('BREAKEVEN');
  });

  it('uses only closed trades for realized metrics and their denominators', () => {
    const trades = [
      makeTrade({ entryPrice: 100, exitPrice: 110, stopLoss: 90 }),
      makeTrade({ entryPrice: 100, exitPrice: 95, stopLoss: 110 }),
      makeTrade({ entryPrice: 100, exitPrice: 100, stopLoss: 90 }),
      makeTrade({ entryPrice: 100, exitPrice: '', stopLoss: 90 }),
    ];
    const metrics = computePortfolioMetrics(trades);

    expect(metrics.totalTrades).toBe(4);
    expect(metrics.closedTradesCount).toBe(3);
    expect(metrics.winsCount).toBe(1);
    expect(metrics.lossesCount).toBe(1);
    expect(metrics.breakevenCount).toBe(1);
    expect(metrics.winRate).toBe(33.3);
    expect(metrics.totalNetPnl).toBe(5);
    expect(metrics.expectancy).toBe(1.67);
    expect(metrics.profitFactor).toBe(2);
    expect(metrics.equityCurve).toHaveLength(3);
    expect(metrics.dailySeries[0].trades).toBe(3);
  });

  it('averages R only across closed trades with valid positive initial risk', () => {
    const trades = [
      makeTrade({ entryPrice: 100, exitPrice: 110, stopLoss: 90 }),
      makeTrade({ entryPrice: 100, exitPrice: 110, stopLoss: '' }),
      makeTrade({ entryPrice: 100, exitPrice: '', stopLoss: 90 }),
    ];
    const metrics = computePortfolioMetrics(trades);

    expect(metrics.avgRMultiple).toBe(1);
  });

  it('returns null Profit Factor when there are no losing closed trades', () => {
    const metrics = computePortfolioMetrics([
      makeTrade({ entryPrice: 100, exitPrice: 110 }),
      makeTrade({ entryPrice: 100, exitPrice: 100 }),
    ]);
    expect(metrics.profitFactor).toBeNull();
  });

  it('returns zero Profit Factor when there are losses but no wins', () => {
    const metrics = computePortfolioMetrics([
      makeTrade({ entryPrice: 100, exitPrice: 95, stopLoss: 110 }),
    ]);
    expect(metrics.profitFactor).toBe(0);
  });

  it('returns zero realized metrics and null Profit Factor for an empty list', () => {
    const metrics = computePortfolioMetrics([]);
    expect(metrics.totalNetPnl).toBe(0);
    expect(metrics.winRate).toBe(0);
    expect(metrics.expectancy).toBe(0);
    expect(metrics.avgRMultiple).toBe(0);
    expect(metrics.profitFactor).toBeNull();
    expect(metrics.totalTrades).toBe(0);
    expect(metrics.closedTradesCount).toBe(0);
  });

  it('returns zero Win Rate and Expectancy when all trades are open', () => {
    const metrics = computePortfolioMetrics([makeTrade({ exitPrice: '' })]);
    expect(metrics.winRate).toBe(0);
    expect(metrics.expectancy).toBe(0);
    expect(metrics.totalNetPnl).toBe(0);
    expect(metrics.closedTradesCount).toBe(0);
    expect(metrics.equityCurve).toHaveLength(0);
  });
});
