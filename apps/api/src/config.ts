import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCES } from '@adf/core';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

/** Repo root: this file lives at apps/api/{src,dist}/config.*. */
export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

// Load .env from the repo root first, then the current directory (either may exist).
loadDotenv({ path: [resolve(REPO_ROOT, '.env'), resolve(process.cwd(), '.env')], quiet: true });

const csv = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const ConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_PATH: z
    .string()
    .default('./data/adf.db')
    .transform((p) => (p === ':memory:' ? p : resolve(REPO_ROOT, p))),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLED_SOURCES: z
    .string()
    .default('')
    .transform(csv)
    .pipe(z.array(z.enum(SOURCES))),
  POLL_INTERVAL_MINUTES: z.coerce.number().positive().default(5),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = ConfigSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid configuration:\n${issues}`);
  }
  return parsed.data;
}
