/**
 * Fixed market types (chosen in Add market → Market type).
 * Market name is free-form and must not be used to infer type.
 */
export const MARKET_TYPES = ['Stocks', 'Forex', 'Crypto', 'Futures', 'Options'];

/** @deprecated Use MARKET_TYPES — kept for older imports */
export const MARKET_NAME_PRESETS = MARKET_TYPES;

const MARKET_TYPE_SET = new Set(MARKET_TYPES);

/**
 * Normalize a stored market type to one of the fixed types.
 * @param {string} [type]
 * @returns {'Stocks'|'Forex'|'Crypto'|'Futures'|'Options'|null}
 */
export function normalizeMarketType(type) {
  if (!type || typeof type !== 'string') return null;
  const trimmed = type.trim();
  const match = MARKET_TYPES.find((t) => t.toLowerCase() === trimmed.toLowerCase());
  return match || null;
}

/** Maps market type to trade metadata asset class. */
export function assetClassFromMarketType(type) {
  return normalizeMarketType(type) || 'Stocks';
}

/**
 * @deprecated Prefer assetClassFromMarketType(market.type).
 * Name must not drive catalog selection.
 */
export function assetClassFromMarketName(name) {
  const normalized = normalizeMarketType(name);
  return normalized || 'Stocks';
}

export function isKnownMarketType(type) {
  return MARKET_TYPE_SET.has(normalizeMarketType(type));
}
