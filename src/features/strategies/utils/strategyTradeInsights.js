import { normalizeMarketType } from '@/constants/markets';

/**
 * @param {Array} trades enriched trades
 * @param {{ id: number, name: string }} strategy
 */
export function tradesForStrategy(trades, strategy) {
  if (!strategy) return [];
  return trades.filter(
    (t) =>
      t.outcome !== 'OPEN' &&
      (t.strategyId === strategy.id || (t.setup && t.setup === strategy.name))
  );
}

export function buildStrategyEquitySeries(trades, strategy) {
  const rows = tradesForStrategy(trades, strategy)
    .slice()
    .sort((a, b) => {
      const d = String(a.date ?? '').localeCompare(String(b.date ?? ''));
      if (d !== 0) return d;
      return String(a.entryTime ?? '').localeCompare(String(b.entryTime ?? ''));
    });

  let cumulative = 0;
  const points = rows.map((t) => {
    cumulative += Number(t.netPnl) || 0;
    return cumulative;
  });

  if (points.length === 0) return [];
  if (points.length === 1) return [0, points[0]];
  return points;
}

/**
 * Market types seen on logged trades, then strategy type / tags.
 * @param {Array} trades
 * @param {Object} strategy
 * @param {Array<{ name: string, type?: string }>} [markets]
 */
export function marketTypesForStrategy(trades, strategy, markets = []) {
  const fromApi = (strategy?.marketTypes || [])
    .map((t) => normalizeMarketType(t))
    .filter(Boolean);
  if (fromApi.length > 0) {
    return [...new Set(fromApi)].sort((a, b) => a.localeCompare(b));
  }

  const types = new Set();
  const marketByName = new Map((markets || []).map((m) => [m.name, m]));

  for (const t of tradesForStrategy(trades, strategy)) {
    const fromMarket = normalizeMarketType(marketByName.get(t.marketName)?.type);
    if (fromMarket) types.add(fromMarket);
    const fromAsset = normalizeMarketType(t.assetClass);
    if (fromAsset) types.add(fromAsset);
  }

  for (const tag of strategy?.tags || []) {
    const fromTag = normalizeMarketType(tag);
    if (fromTag) types.add(fromTag);
  }

  return [...types].sort((a, b) => a.localeCompare(b));
}

export function rulesFollowedPercent(trades, strategy) {
  const rows = tradesForStrategy(trades, strategy);
  if (!rows.length) return null;
  const followed = rows.filter((t) => (t.mistake || 'None') === 'None').length;
  return Math.round((followed / rows.length) * 100);
}
