import { ADAPTERS } from '@adf/adapters';
import type { SourceAdapter } from '@adf/core';
import { Cron } from 'croner';
import { eq } from 'drizzle-orm';
import type { Config } from './config.js';
import type { Db } from './db/index.js';
import { adapterRuns } from './db/schema.js';
import { bus } from './events.js';
import type { Logger } from './log.js';

/**
 * Polls each enabled adapter on an interval. Ingestion (normalize, classify,
 * dedup, persist) is wired in Phase 2; today a run only records itself.
 */
export function startScheduler(config: Config, db: Db, log: Logger) {
  const enabled = ADAPTERS.filter((a) => config.ENABLED_SOURCES.includes(a.id));
  const skipped = config.ENABLED_SOURCES.filter((id) => !ADAPTERS.some((a) => a.id === id));
  if (skipped.length) log.warn('enabled sources with no adapter yet', { skipped });

  const jobs: Cron[] = [];
  for (const adapter of enabled) {
    const missing = adapter.requiredEnv.filter((k) => !process.env[k]);
    if (missing.length) {
      log.warn('adapter disabled: missing env', { source: adapter.id, missing });
      continue;
    }
    const seconds = Math.max(config.POLL_INTERVAL_MINUTES * 60, adapter.minIntervalSeconds);
    log.info('scheduling adapter', { source: adapter.id, everySeconds: seconds });
    jobs.push(
      new Cron(`*/${Math.max(1, Math.round(seconds / 60))} * * * *`, { protect: true }, () =>
        runAdapter(adapter, db, log.child(adapter.id)),
      ),
    );
  }
  return {
    stop: () => {
      for (const j of jobs) j.stop();
    },
  };
}

export async function runAdapter(adapter: SourceAdapter, db: Db, log: Logger) {
  const startedAt = new Date();
  const run = db.insert(adapterRuns).values({ source: adapter.id, startedAt }).returning().get();
  try {
    const env = Object.fromEntries(adapter.requiredEnv.map((k) => [k, process.env[k] ?? '']));
    const result = await adapter.fetch({ env, log });
    // TODO(phase 2): normalize -> classify -> dedup -> upsert -> publish events
    db.update(adapterRuns)
      .set({
        finishedAt: new Date(),
        ok: true,
        fetched: result.listings.length,
        inserted: 0,
        updated: 0,
      })
      .where(eqId(run.id))
      .run();
    bus.publish({ type: 'adapter.run', source: adapter.id, ok: true });
    log.info('run ok', { fetched: result.listings.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    db.update(adapterRuns)
      .set({ finishedAt: new Date(), ok: false, error: message })
      .where(eqId(run.id))
      .run();
    bus.publish({ type: 'adapter.run', source: adapter.id, ok: false });
    log.error('run failed', { error: message });
  }
}

function eqId(id: number) {
  return eq(adapterRuns.id, id);
}
