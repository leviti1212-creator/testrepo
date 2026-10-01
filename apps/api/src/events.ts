import { EventEmitter } from 'node:events';

/** Process-local event bus; the SSE endpoint fans these out to the UI. */
export type AppEvent =
  | { type: 'listing.new'; listingId: number }
  | { type: 'listing.updated'; listingId: number }
  | { type: 'adapter.run'; source: string; ok: boolean };

class Bus extends EventEmitter {
  publish(e: AppEvent) {
    this.emit('event', e);
  }
  subscribe(fn: (e: AppEvent) => void): () => void {
    this.on('event', fn);
    return () => this.off('event', fn);
  }
}

export const bus = new Bus();
