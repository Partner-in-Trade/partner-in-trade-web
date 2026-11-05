/**
 * Aggregate closed-trade stats keyed by strategy id and by setup name.
 * @param {Array<{ strategyId?: number, setup?: string, outcome?: string, netPnl?: number }>} trades
 */
export function buildStrategyPerformanceMap(trades) {
  const empty = () => ({ tradeCount: 0, wins: 0, netPnl: 0 });

  const byId = {};
  const byName = {};

  const bump = (bucket, trade) => {
    bucket.tradeCount += 1;
    if (trade.outcome === 'WIN') bucket.wins += 1;
    bucket.netPnl = Number((bucket.netPnl + (trade.netPnl || 0)).toFixed(2));
  };

  trades.forEach((t) => {
    if (t.outcome === 'OPEN') return;
    if (t.strategyId != null) {
      if (!byId[t.strategyId]) byId[t.strategyId] = empty();
      bump(byId[t.strategyId], t);
    }
    if (t.setup) {
      if (!byName[t.setup]) byName[t.setup] = empty();
      bump(byName[t.setup], t);
    }
  });

  return { byId, byName };
}

export function performanceForStrategy(perfMap, strategy) {
  const fallback = { tradeCount: 0, wins: 0, netPnl: 0 };
  if (!strategy) return fallback;
  return (
    perfMap.byId[strategy.id] ||
    perfMap.byName[strategy.name] ||
    fallback
  );
}

export function winRatePercent(stats) {
  if (!stats.tradeCount) return 0;
  return Math.round((stats.wins / stats.tradeCount) * 100);
}
