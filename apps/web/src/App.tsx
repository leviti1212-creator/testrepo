import { CATEGORIES, SOURCES } from '@adf/core';
import { useEffect, useState } from 'react';
import { fetchListings, type ListingRow, subscribeEvents } from './api.js';

const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  mac: 'Mac',
  watch: 'Watch',
  airpods: 'AirPods',
  accessory: 'Accessories',
};

export function App() {
  const [items, setItems] = useState<ListingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const load = () =>
      fetchListings()
        .then(setItems)
        .catch((e: Error) => setError(e.message));
    load();
    const unsubscribe = subscribeEvents(() => load());
    setLive(true);
    return () => {
      unsubscribe();
      setLive(false);
    };
  }, []);

  return (
    <div className="flex h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-800 p-4 space-y-6">
        <h1 className="text-lg font-semibold"> Deal Finder</h1>
        <section>
          <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Categories</h2>
          <ul className="space-y-1 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c} className="text-zinc-300">
                {CATEGORY_LABELS[c]}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Sources</h2>
          <ul className="space-y-1 text-sm">
            {SOURCES.map((s) => (
              <li key={s} className="text-zinc-300">
                {s}
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-3 flex items-center gap-3">
          <input
            placeholder="Search listings (coming in phase 2)"
            disabled
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm"
          />
          <span className={`text-xs ${live ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {live ? '● live' : '○ offline'}
          </span>
        </header>

        <div className="p-6">
          {error && <p className="text-red-400 text-sm">Error: {error}</p>}
          {!error && items.length === 0 && (
            <p className="text-zinc-500 text-sm">
              No listings yet. Enable a source in <code>.env</code> and start the API.
            </p>
          )}
          <ul className="divide-y divide-zinc-800">
            {items.map((l) => (
              <li key={l.id} className="py-3 flex items-baseline gap-4">
                <span className="w-24 text-right font-mono tabular-nums">
                  {l.price === null ? '—' : `$${l.price}`}
                </span>
                <a href={l.url} target="_blank" rel="noreferrer" className="flex-1 hover:underline">
                  {l.title}
                </a>
                <span className="text-xs text-zinc-500">{l.source}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
