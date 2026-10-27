import cryptoList from '@/assets/crypto-list.json';
import forexList from '@/assets/forex-list.json';
import indianStocksList from '@/assets/indian-stocks-symbols.json';
import { normalizeMarketType } from '@/constants/markets';

/**
 * @typedef {{ symbol: string, label: string, name: string, image?: string }} SymbolOption
 */

/** @type {Record<string, SymbolOption[]>} */
const CATALOGS = {
  Crypto: cryptoList.map((item) => ({
    symbol: String(item.symbol || '').toUpperCase(),
    label: String(item.symbol || '').toUpperCase(),
    name: item.name || '',
    image: item.image,
  })),
  Forex: forexList.map((item) => ({
    symbol: String(item.symbol || '').toUpperCase(),
    label: item.display || item.symbol,
    name: item.name || '',
  })),
  Stocks: indianStocksList.map((item) => ({
    symbol: String(item.symbol || '').toUpperCase(),
    label: item.symbol || '',
    name: item.name || '',
  })),
};

/**
 * Catalog for a fixed market type (never inferred from market name).
 * @param {string} [marketType]
 * @returns {'Crypto'|'Forex'|'Stocks'|null}
 */
export function symbolCatalogTypeForMarketType(marketType) {
  const type = normalizeMarketType(marketType);
  if (type === 'Crypto' || type === 'Forex' || type === 'Stocks') return type;
  return null;
}

/**
 * @deprecated Use symbolCatalogTypeForMarketType(market.type)
 * @param {string} [marketName]
 */
export function symbolCatalogTypeForMarket(marketName) {
  return symbolCatalogTypeForMarketType(marketName);
}

/**
 * Filter catalog symbols for typeahead. Empty query returns top of list.
 * @param {string|null} catalogType
 * @param {string} query
 * @param {number} [limit=12]
 * @returns {SymbolOption[]}
 */
export function searchSymbols(catalogType, query, limit = 12) {
  if (!catalogType || !CATALOGS[catalogType]) return [];
  const list = CATALOGS[catalogType];
  const q = String(query || '').trim().toUpperCase();
  if (!q) return list.slice(0, limit);

  const starts = [];
  const contains = [];
  for (const item of list) {
    const sym = item.symbol.toUpperCase();
    const name = (item.name || '').toUpperCase();
    const label = (item.label || '').toUpperCase();
    if (sym.startsWith(q) || label.startsWith(q)) {
      starts.push(item);
    } else if (sym.includes(q) || name.includes(q) || label.includes(q)) {
      contains.push(item);
    }
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}
