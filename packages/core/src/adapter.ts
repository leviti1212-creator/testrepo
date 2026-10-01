import type { ListingInput, Source } from './listing.js';

export interface AdapterContext {
  /** Config values the adapter declared in `requiredEnv`, already validated present. */
  env: Record<string, string>;
  /** Structured logger; adapters must not use console directly. */
  log: {
    info: (msg: string, meta?: object) => void;
    warn: (msg: string, meta?: object) => void;
    error: (msg: string, meta?: object) => void;
  };
  /** Timestamp of the previous successful run, for incremental fetches. */
  lastRunAt?: Date;
  signal?: AbortSignal;
}

export interface FetchResult {
  listings: ListingInput[];
  /** Source ids seen this run that are no longer active (ended/closed), if the source reports it. */
  endedSourceIds?: string[];
}

/**
 * A source adapter. One per marketplace. Adapters are pure fetch+normalize:
 * they never touch the database, never dedupe, never classify.
 */
export interface SourceAdapter {
  id: Source;
  displayName: string;
  /** Env var names that must be set for this adapter to be enabled. */
  requiredEnv: readonly string[];
  /** Minimum seconds between runs; the scheduler never polls faster than this. */
  minIntervalSeconds: number;
  fetch(ctx: AdapterContext): Promise<FetchResult>;
}
