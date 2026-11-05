import {
  strategiesApi,
  STRATEGIES_MAX_PAGE_SIZE,
} from '@/features/strategies/api/strategiesApi';

function strategiesByNameFromList(strategies) {
  const strategiesByName = {};
  for (const s of strategies) {
    if (s?.name && s.id != null) {
      strategiesByName[s.name] = s.id;
    }
  }
  return strategiesByName;
}

/**
 * Loads the user's strategies from the API (single fetch for bootstrap + strategies UI).
 * @param {number} userId
 * @returns {Promise<{ strategies: object[], strategiesByName: Record<string, number> }>}
 */
export async function fetchUserStrategies(userId, search) {
  const stratRes = await strategiesApi.getByUser(
    userId,
    0,
    STRATEGIES_MAX_PAGE_SIZE,
    search
  );
  const strategies = stratRes.data?.strategies || [];
  return {
    strategies,
    strategiesByName: strategiesByNameFromList(strategies),
  };
}

/**
 * @param {number} userId
 * @returns {Promise<Record<string, number>>}
 */
export async function loadStrategiesByName(userId) {
  const { strategiesByName } = await fetchUserStrategies(userId);
  return strategiesByName;
}

/** @deprecated use loadStrategiesByName */
export const ensureStrategies = loadStrategiesByName;
