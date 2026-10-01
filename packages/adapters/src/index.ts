import type { Source, SourceAdapter } from '@adf/core';

/**
 * Registry of all known adapters. Real adapters (reddit, ebay, ...) land in
 * Phase 2; each lives in its own folder here and is added to this list.
 */
export const ADAPTERS: SourceAdapter[] = [];

export function getAdapter(id: Source): SourceAdapter | undefined {
  return ADAPTERS.find((a) => a.id === id);
}
