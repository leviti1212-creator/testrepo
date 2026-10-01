import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const listings = sqliteTable(
  'listings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    source: text('source').notNull(),
    sourceId: text('source_id').notNull(),
    url: text('url').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    price: real('price'),
    shippingCost: real('shipping_cost'),
    currency: text('currency').notNull().default('USD'),
    condition: text('condition').notNull().default('unknown'),
    listingType: text('listing_type').notNull().default('fixed'),
    location: text('location'),
    sellerName: text('seller_name').notNull(),
    sellerJson: text('seller_json', { mode: 'json' }).notNull(),
    productKey: text('product_key'),
    productJson: text('product_json', { mode: 'json' }),
    imagesJson: text('images_json', { mode: 'json' }).notNull().default('[]'),
    postedAt: integer('posted_at', { mode: 'timestamp_ms' }).notNull(),
    fetchedAt: integer('fetched_at', { mode: 'timestamp_ms' }).notNull(),
    lastSeenAt: integer('last_seen_at', { mode: 'timestamp_ms' }).notNull(),
    status: text('status').notNull().default('active'),
    dealScore: real('deal_score'),
    rawJson: text('raw_json'),
  },
  (t) => [
    uniqueIndex('listings_source_source_id').on(t.source, t.sourceId),
    index('listings_posted_at').on(t.postedAt),
    index('listings_product_key').on(t.productKey),
    index('listings_status').on(t.status),
  ],
);

export const watches = sqliteTable('watches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  query: text('query'),
  categoriesJson: text('categories_json', { mode: 'json' }).notNull().default('[]'),
  productKeysJson: text('product_keys_json', { mode: 'json' }).notNull().default('[]'),
  minStorageGb: integer('min_storage_gb'),
  maxPrice: real('max_price'),
  conditionsJson: text('conditions_json', { mode: 'json' }).notNull().default('[]'),
  sourcesJson: text('sources_json', { mode: 'json' }).notNull().default('[]'),
  shippedOnly: integer('shipped_only', { mode: 'boolean' }).notNull().default(false),
  notifyViaJson: text('notify_via_json', { mode: 'json' }).notNull().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const priceObservations = sqliteTable(
  'price_observations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productKey: text('product_key').notNull(),
    price: real('price').notNull(),
    condition: text('condition').notNull(),
    source: text('source').notNull(),
    /** 'ask' | 'sold' */
    kind: text('kind').notNull(),
    listingId: integer('listing_id').references(() => listings.id),
    observedAt: integer('observed_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [index('price_obs_product_time').on(t.productKey, t.observedAt)],
);

export const adapterRuns = sqliteTable(
  'adapter_runs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    source: text('source').notNull(),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
    finishedAt: integer('finished_at', { mode: 'timestamp_ms' }),
    ok: integer('ok', { mode: 'boolean' }),
    fetched: integer('fetched'),
    inserted: integer('inserted'),
    updated: integer('updated'),
    error: text('error'),
  },
  (t) => [index('adapter_runs_source_started').on(t.source, t.startedAt)],
);
