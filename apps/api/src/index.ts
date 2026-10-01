import { serve } from '@hono/node-server';
import { loadConfig } from './config.js';
import { openDb, runMigrations } from './db/index.js';
import { createLogger } from './log.js';
import { startScheduler } from './scheduler.js';
import { createApp } from './server.js';

const config = loadConfig();
const log = createLogger(config.LOG_LEVEL);

const { db, sqlite } = openDb(config.DATABASE_PATH);
runMigrations(db);
log.info('database ready', { path: config.DATABASE_PATH });

const scheduler = startScheduler(config, db, log.child('scheduler'));
const app = createApp(db);
const server = serve({ fetch: app.fetch, port: config.PORT }, (info) =>
  log.info('api listening', { url: `http://localhost:${info.port}` }),
);

function shutdown() {
  log.info('shutting down');
  scheduler.stop();
  server.close();
  sqlite.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
