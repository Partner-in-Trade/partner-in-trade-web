import { describe, it, expect } from 'vitest';
import {
  searchSymbols,
  symbolCatalogTypeForMarketType,
} from './symbolCatalog';

describe('symbolCatalog', () => {
  it('uses fixed market type only — not market name', () => {
    expect(symbolCatalogTypeForMarketType('Crypto')).toBe('Crypto');
    expect(symbolCatalogTypeForMarketType('Forex')).toBe('Forex');
    expect(symbolCatalogTypeForMarketType('Stocks')).toBe('Stocks');
    expect(symbolCatalogTypeForMarketType('Futures')).toBeNull();
    // Custom names must not drive catalog selection
    expect(symbolCatalogTypeForMarketType('Crypto Live')).toBeNull();
    expect(symbolCatalogTypeForMarketType('my crypto account')).toBeNull();
  });

  it('searches forex by symbol and display', () => {
    const hits = searchSymbols('Forex', 'eur');
    expect(hits.some((h) => h.symbol === 'EURUSD')).toBe(true);
  });

  it('searches crypto by ticker', () => {
    const hits = searchSymbols('Crypto', 'btc');
    expect(hits[0]?.symbol).toBe('BTC');
  });

  it('searches indian stocks by trading symbol', () => {
    const hits = searchSymbols('Stocks', 'reli');
    expect(hits.some((h) => h.symbol.includes('RELI'))).toBe(true);
  });

  it('keeps catalogs isolated by type', () => {
    expect(searchSymbols('Crypto', 'RELIANCE')).toEqual([]);
    expect(searchSymbols('Crypto', 'btc').some((h) => h.symbol === 'BTC')).toBe(true);
    expect(searchSymbols(null, 'AAPL')).toEqual([]);
  });
});
