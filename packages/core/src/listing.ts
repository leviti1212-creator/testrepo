import { z } from 'zod';

export const SOURCES = ['reddit', 'ebay', 'swappa', 'slickdeals', 'apple-refurb'] as const;
export const SourceSchema = z.enum(SOURCES);
export type Source = z.infer<typeof SourceSchema>;

export const CONDITIONS = ['new', 'open-box', 'refurb', 'used', 'for-parts', 'unknown'] as const;
export const ConditionSchema = z.enum(CONDITIONS);
export type Condition = z.infer<typeof ConditionSchema>;

export const LISTING_TYPES = ['fixed', 'auction', 'offer'] as const;
export const ListingTypeSchema = z.enum(LISTING_TYPES);
export type ListingType = z.infer<typeof ListingTypeSchema>;

export const LISTING_STATUSES = ['active', 'sold', 'removed', 'expired'] as const;
export const ListingStatusSchema = z.enum(LISTING_STATUSES);
export type ListingStatus = z.infer<typeof ListingStatusSchema>;

export const SellerSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  /** 0..1 normalized feedback score where available (eBay %, Swappa stars). */
  rating: z.number().min(0).max(1).optional(),
  /** Confirmed trades / feedback count. */
  tradeCount: z.number().int().nonnegative().optional(),
  accountAgeDays: z.number().int().nonnegative().optional(),
});
export type Seller = z.infer<typeof SellerSchema>;

/** Result of classifying a title against the taxonomy. */
export const ProductMatchSchema = z.object({
  /** Stable key, e.g. "iphone-15-pro" or "macbook-air-13-m2". */
  productKey: z.string(),
  category: z.string(),
  family: z.string(),
  model: z.string(),
  storageGb: z.number().int().positive().optional(),
  memoryGb: z.number().int().positive().optional(),
  chip: z.string().optional(),
  year: z.number().int().optional(),
  color: z.string().optional(),
  /** 0..1 classifier confidence. */
  confidence: z.number().min(0).max(1),
});
export type ProductMatch = z.infer<typeof ProductMatchSchema>;

/**
 * A normalized listing. Every adapter must produce this shape; everything
 * downstream (storage, scoring, alerts, UI) only ever sees this.
 */
export const ListingSchema = z.object({
  source: SourceSchema,
  /** Unique within the source (Reddit post id, eBay item id, ...). */
  sourceId: z.string().min(1),
  url: z.string().url(),
  title: z.string().min(1),
  body: z.string().optional(),
  /** USD. Null when the post is "offers only" or the price could not be parsed. */
  price: z.number().nonnegative().nullable(),
  /** 0 = free shipping, null = unknown or local only. */
  shippingCost: z.number().nonnegative().nullable(),
  currency: z.string().length(3).default('USD'),
  condition: ConditionSchema.default('unknown'),
  listingType: ListingTypeSchema.default('fixed'),
  location: z.string().optional(),
  seller: SellerSchema,
  product: ProductMatchSchema.optional(),
  images: z.array(z.string().url()).default([]),
  postedAt: z.coerce.date(),
  status: ListingStatusSchema.default('active'),
  /** Original payload, kept for re-parsing when the classifier improves. */
  raw: z.unknown().optional(),
});
export type Listing = z.infer<typeof ListingSchema>;
export type ListingInput = z.input<typeof ListingSchema>;

/** Globally unique id for a listing across sources. */
export function listingKey(l: Pick<Listing, 'source' | 'sourceId'>): string {
  return `${l.source}:${l.sourceId}`;
}
