import { desc } from 'drizzle-orm';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamSSE } from 'hono/streaming';
import { z } from 'zod';
import type { Db } from './db/index.js';
import { adapterRuns, listings } from './db/schema.js';
import { bus } from './events.js';

const ListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export function createApp(db: Db) {
  const app = new Hono();
  app.use('/api/*', cors());

  app.get('/api/health', (c) => c.json({ ok: true, time: new Date().toISOString() }));

  app.get('/api/listings', (c) => {
    const q = ListQuery.safeParse(c.req.query());
    if (!q.success) return c.json({ error: q.error.flatten() }, 400);
    const rows = db
      .select()
      .from(listings)
      .orderBy(desc(listings.postedAt))
      .limit(q.data.limit)
      .offset(q.data.offset)
      .all();
    return c.json({ items: rows });
  });

  app.get('/api/sources/runs', (c) => {
    const rows = db.select().from(adapterRuns).orderBy(desc(adapterRuns.startedAt)).limit(50).all();
    return c.json({ items: rows });
  });

  app.get('/api/events', (c) =>
    streamSSE(c, async (stream) => {
      await stream.writeSSE({ event: 'hello', data: JSON.stringify({ time: Date.now() }) });
      const unsubscribe = bus.subscribe((e) => {
        void stream.writeSSE({ event: e.type, data: JSON.stringify(e) });
      });
      const keepalive = setInterval(
        () => void stream.writeSSE({ event: 'ping', data: '' }),
        25_000,
      );
      stream.onAbort(() => {
        clearInterval(keepalive);
        unsubscribe();
      });
      // Keep the handler alive until the client disconnects.
      await new Promise<void>((resolve) => stream.onAbort(resolve));
    }),
  );

  return app;
}
