import { describe, expect, it } from 'vitest';
import { loadConfig, REPO_ROOT } from './config.js';

describe('loadConfig', () => {
  it('parses enabled sources and resolves the db path against the repo root', () => {
    const c = loadConfig({ ENABLED_SOURCES: 'reddit, ebay', DATABASE_PATH: './data/x.db' });
    expect(c.ENABLED_SOURCES).toEqual(['reddit', 'ebay']);
    expect(c.DATABASE_PATH).toBe(`${REPO_ROOT}/data/x.db`);
    expect(c.PORT).toBe(3000);
  });

  it('rejects unknown sources with a readable error', () => {
    expect(() => loadConfig({ ENABLED_SOURCES: 'craigslist' })).toThrow(/ENABLED_SOURCES/);
  });
});
