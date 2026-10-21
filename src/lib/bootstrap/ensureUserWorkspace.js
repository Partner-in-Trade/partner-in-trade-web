import { PLAYBOOK_SETUPS } from '@/data/mockTrades';
import { marketsApi } from '@/features/markets/api/marketsApi';
import { strategiesApi } from '@/features/strategies/api/strategiesApi';

const DEFAULT_MARKET_NAME = 'Primary';
const STRATEGY_TYPE = 'Playbook';
const STRATEGY_TIMEFRAME = '5m';

/**
 * Ensures user has at least one market and playbook strategies.
 * @param {number} userId
 * @returns {Promise<{ market: Object, strategiesByName: Record<string, number> }>}
 */
export async function ensureUserWorkspace(userId) {
  const marketsRes = await marketsApi.getMarkets(userId);
  let markets = marketsRes.data || [];
  if (!markets.length) {
    const created = await marketsApi.createMarket(DEFAULT_MARKET_NAME, userId);
    markets = [created.data];
  }
  const market = markets[0];

  const stratRes = await strategiesApi.getByUser(userId, 0, 100);
  const existing = stratRes.data?.strategies || [];
  const strategiesByName = {};
  for (const s of existing) {
    strategiesByName[s.name] = s.id;
  }

  for (const name of PLAYBOOK_SETUPS) {
    if (strategiesByName[name]) continue;
    const created = await strategiesApi.create({
      name,
      type: STRATEGY_TYPE,
      timeframe: STRATEGY_TIMEFRAME,
      userId,
      tags: [],
      description: '',
    });
    strategiesByName[created.data.name] = created.data.id;
  }

  return { market, strategiesByName };
}
