import type { Condition, Source } from '@adf/core';

/** Shape returned by GET /api/listings (a DB row, flattened). */
export interface ListingRow {
  id: number;
  source: Source;
  sourceId: string;
  url: string;
  title: string;
  price: number | null;
  shippingCost: number | null;
  condition: Condition;
  location: string | null;
  sellerName: string;
  productKey: string | null;
  imagesJson: string[];
  postedAt: number;
  status: string;
  dealScore: number | null;
}

export async function fetchListings(limit = 50): Promise<ListingRow[]> {
  const res = await fetch(`/api/listings?limit=${limit}`);
  if (!res.ok) throw new Error(`listings: ${res.status}`);
  const body = (await res.json()) as { items: ListingRow[] };
  return body.items;
}

export function subscribeEvents(onEvent: (type: string, data: unknown) => void): () => void {
  const es = new EventSource('/api/events');
  const handler = (e: MessageEvent) => onEvent(e.type, e.data ? JSON.parse(e.data) : null);
  for (const t of ['listing.new', 'listing.updated', 'adapter.run'])
    es.addEventListener(t, handler);
  return () => es.close();
}
