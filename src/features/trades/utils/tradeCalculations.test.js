import { describe, it, expect } from 'vitest';
import {
  canCalculateNetPnl,
  enrichTrade,
  computePortfolioMetrics,
} from './tradeCalculations';

describe('tradeCalculations', () => {
  it('canCalculateNetPnl requires entry and exit prices', () => {
    expect(canCalculateNetPnl({ entryPrice: 100, exitPrice: 110 })).toBe(true);
    expect(canCalculateNetPnl({ entryPrice: 100, exitPrice: '' })).toBe(false);
  });

  it('enrichTrade computes LONG net PnL and WIN outcome', () => {
    const enriched = enrichTrade({
      direction: 'LONG',
      quantity: 10,
      entryPrice: 100,
      exitPrice: 110,
      stopLoss: 95,
      fees: 5,
    });
    expect(enriched.netPnl).toBe(95);
    expect(enriched.outcome).toBe('WIN');
    expect(enriched.rMultiple).toBeGreaterThan(0);
  });

  it('enrichTrade computes SHORT net PnL', () => {
    const enriched = enrichTrade({
      direction: 'SHORT',
      quantity: 2,
      entryPrice: 50,
      exitPrice: 45,
      stopLoss: 55,
      fees: 0,
    });
    expect(enriched.netPnl).toBe(10);
  });

  it('enrichTrade marks open trades', () => {
    const enriched = enrichTrade({
      direction: 'LONG',
      quantity: 1,
      entryPrice: 100,
      exitPrice: '',
      stopLoss: 90,
      fees: 0,
    });
    expect(enriched.isOpen).toBe(true);
    expect(enriched.outcome).toBe('OPEN');
  });

  it('computePortfolioMetrics aggregates wins and win rate', () => {
    const trades = [
      enrichTrade({
        date: '2025-05-01',
        entryTime: '09:00',
        direction: 'LONG',
        quantity: 1,
        entryPrice: 10,
        exitPrice: 20,
        stopLoss: 5,
        fees: 0,
      }),
      enrichTrade({
        date: '2025-05-02',
        entryTime: '09:00',
        direction: 'LONG',
        quantity: 1,
        entryPrice: 10,
        exitPrice: 5,
        stopLoss: 12,
        fees: 0,
      }),
    ];
    const metrics = computePortfolioMetrics(trades);
    expect(metrics.totalTrades).toBe(2);
    expect(metrics.winRate).toBe(50);
    expect(metrics.totalNetPnl).not.toBe(0);
  });

  it('computePortfolioMetrics returns zeros for empty list', () => {
    const metrics = computePortfolioMetrics([]);
    expect(metrics.totalNetPnl).toBe(0);
    expect(metrics.winRate).toBe(0);
  });
});
