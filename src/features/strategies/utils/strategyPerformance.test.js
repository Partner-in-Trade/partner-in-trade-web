import { describe, it, expect } from 'vitest';
import {
  buildStrategyPerformanceMap,
  performanceForStrategy,
  winRatePercent,
} from './strategyPerformance';

describe('strategyPerformance', () => {
  it('buildStrategyPerformanceMap groups by strategyId and setup name', () => {
    const map = buildStrategyPerformanceMap([
      { strategyId: 1, setup: 'A', outcome: 'WIN', netPnl: 100 },
      { strategyId: 1, setup: 'A', outcome: 'LOSS', netPnl: -40 },
      { setup: 'Legacy', outcome: 'WIN', netPnl: 50 },
    ]);
    expect(map.byId[1].tradeCount).toBe(2);
    expect(map.byId[1].netPnl).toBe(60);
    expect(map.byName.Legacy.tradeCount).toBe(1);
  });

  it('performanceForStrategy prefers id then name', () => {
    const map = buildStrategyPerformanceMap([
      { strategyId: 5, setup: 'X', outcome: 'WIN', netPnl: 10 },
    ]);
    expect(performanceForStrategy(map, { id: 5, name: 'X' }).netPnl).toBe(10);
    expect(performanceForStrategy(map, { id: 99, name: 'X' }).netPnl).toBe(10);
  });

  it('winRatePercent handles zero trades', () => {
    expect(winRatePercent({ tradeCount: 0, wins: 0 })).toBe(0);
    expect(winRatePercent({ tradeCount: 4, wins: 3 })).toBe(75);
  });
});
