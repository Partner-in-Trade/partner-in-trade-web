import { describe, it, expect } from 'vitest';
import { strategyListStatus, statusMatchesFilter } from './strategyStatus';

describe('strategyListStatus', () => {
  it('uses isActive from API', () => {
    expect(strategyListStatus({ isActive: true }, {})).toBe('active');
    expect(strategyListStatus({ isActive: false }, {})).toBe('draft');
  });

  it('filters match active and draft', () => {
    expect(statusMatchesFilter('active', 'active')).toBe(true);
    expect(statusMatchesFilter('draft', 'active')).toBe(false);
  });
});
