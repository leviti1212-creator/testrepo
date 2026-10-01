import { describe, expect, it } from 'vitest';
import { openDb, runMigrations } from './db/index.js';
import { createApp } from './server.js';

function makeApp() {
  const { db } = openDb(':memory:');
  runMigrations(db);
  return createApp(db);
}

describe('api', () => {
  it('reports health', async () => {
    const res = await makeApp().request('/api/health');
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it('lists (empty) listings and validates query', async () => {
    const app = makeApp();
    const ok = await app.request('/api/listings?limit=10');
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ items: [] });
    const bad = await app.request('/api/listings?limit=0');
    expect(bad.status).toBe(400);
  });
});
