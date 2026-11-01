import { describe, it, expect } from 'vitest';
import { TRADING_SESSIONS } from './tradingSessions';

describe('TRADING_SESSIONS', () => {
  it('lists canonical session labels for API storage', () => {
    expect(TRADING_SESSIONS).toEqual([
      'Sydney Session',
      'Asian Session',
      'London Session',
      'New York Session',
    ]);
  });
});
