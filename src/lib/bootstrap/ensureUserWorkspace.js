import { PLAYBOOK_SETUPS } from '@/data/mockTrades';
import { strategiesApi } from '@/features/strategies/api/strategiesApi';

const STRATEGY_TYPE = 'Playbook';
const STRATEGY_TIMEFRAME = '5m';

/**
 * Seeds playbook strategies for the user if missing.
 * @param {number} userId
 * @returns {Promise<Record<string, number>>}
 */
export async function ensureStrategies(userId) {
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

  return strategiesByName;
}
