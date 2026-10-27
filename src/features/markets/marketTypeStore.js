import { normalizeMarketType } from '@/constants/markets';

const STORAGE_KEY = 'pit_market_types';

function readMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/**
 * Persist fixed market type for a market id (backend may not store type yet).
 * @param {number|string} marketId
 * @param {string} type
 */
export function saveMarketType(marketId, type) {
  const normalized = normalizeMarketType(type);
  if (marketId == null || !normalized) return;
  const map = readMap();
  map[String(marketId)] = normalized;
  writeMap(map);
}

/**
 * @param {number|string} marketId
 * @returns {string|null}
 */
export function getStoredMarketType(marketId) {
  if (marketId == null) return null;
  return normalizeMarketType(readMap()[String(marketId)]);
}

/**
 * Attach `type` onto API markets: API field wins, else localStorage.
 * @param {Array<Object>} markets
 * @returns {Array<Object>}
 */
export function withMarketTypes(markets) {
  if (!Array.isArray(markets)) return [];
  const map = readMap();
  return markets.map((m) => {
    const fromApi = normalizeMarketType(m?.type);
    const fromStore = normalizeMarketType(map[String(m?.id)]);
    const type = fromApi || fromStore || null;
    return type ? { ...m, type } : { ...m, type: null };
  });
}

/**
 * @param {number|string} marketId
 */
export function clearStoredMarketType(marketId) {
  if (marketId == null) return;
  const map = readMap();
  delete map[String(marketId)];
  writeMap(map);
}
