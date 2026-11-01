import { strategiesApi } from '@/features/strategies/api/strategiesApi';

/**
 * Loads the user's strategies from the API (no auto-seeding).
 * @param {number} userId
 * @returns {Promise<Record<string, number>>}
 */
export async function loadStrategiesByName(userId) {
  const stratRes = await strategiesApi.getByUser(userId, 0, 200);
  const existing = stratRes.data?.strategies || [];
  const strategiesByName = {};
  for (const s of existing) {
    if (s?.name && s.id != null) {
      strategiesByName[s.name] = s.id;
    }
  }
  return strategiesByName;
}

/** @deprecated use loadStrategiesByName */
export const ensureStrategies = loadStrategiesByName;
