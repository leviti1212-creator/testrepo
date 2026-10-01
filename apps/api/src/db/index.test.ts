import { describe, expect, it } from 'vitest';
import { openDb, runMigrations } from './index.js';
import { listings } from './schema.js';

describe('db', () => {
  it('migrates an in-memory database and round-trips a listing', () => {
    const { db } = openDb(':memory:');
    runMigrations(db);
    const now = new Date();
    db.insert(listings)
      .values({
        source: 'reddit',
        sourceId: 'x1',
        url: 'https://example.com/x1',
        title: 'test',
        price: 100,
        sellerName: 'u',
        sellerJson: { name: 'u' },
        postedAt: now,
        fetchedAt: now,
        lastSeenAt: now,
      })
      .run();
    const rows = db.select().from(listings).all();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.postedAt.getTime()).toBe(now.getTime());
  });
});
