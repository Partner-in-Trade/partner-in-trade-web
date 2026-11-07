import { describe, it, expect } from 'vitest';
import {
  buildStrategyEquitySeries,
  marketTypesForStrategy,
  rulesFollowedPercent,
} from './strategyTradeInsights';

describe('strategyTradeInsights', () => {
  const strategy = { id: 5, name: 'ORB' };

  it('builds cumulative equity points for strategy trades', () => {
    const trades = [
      { strategyId: 5, outcome: 'WIN', netPnl: 100, date: '2025-01-01', mistake: 'None' },
      { strategyId: 5, outcome: 'LOSS', netPnl: -40, date: '2025-01-02', mistake: 'FOMO' },
    ];
    expect(buildStrategyEquitySeries(trades, strategy)).toEqual([100, 60]);
  });

  it('prefers marketTypes from strategy API', () => {
    expect(
      marketTypesForStrategy([], { id: 5, marketTypes: ['Crypto', 'Futures'] }, [])
    ).toEqual(['Crypto', 'Futures']);
  });

  it('collects market types from trades and strategy', () => {
    const trades = [
      {
        strategyId: 5,
        outcome: 'WIN',
        netPnl: 1,
        marketName: 'Futures acct',
        assetClass: 'Futures',
      },
    ];
    const markets = [{ name: 'Futures acct', type: 'Futures' }];
    expect(marketTypesForStrategy(trades, { ...strategy, type: 'Futures' }, markets)).toEqual([
      'Futures',
    ]);
  });

  it('computes rules followed percent from mistake tags', () => {
    const trades = [
      { strategyId: 5, outcome: 'WIN', netPnl: 1, mistake: 'None' },
      { strategyId: 5, outcome: 'LOSS', netPnl: -1, mistake: 'FOMO' },
      { strategyId: 5, outcome: 'WIN', netPnl: 2, mistake: 'None' },
    ];
    expect(rulesFollowedPercent(trades, strategy)).toBe(67);
  });
});
