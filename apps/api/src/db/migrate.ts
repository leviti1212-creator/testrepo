import { loadConfig } from '../config.js';
import { openDb, runMigrations } from './index.js';

const config = loadConfig();
const { db, sqlite } = openDb(config.DATABASE_PATH);
runMigrations(db);
sqlite.close();
console.log(`Migrated ${config.DATABASE_PATH}`);
