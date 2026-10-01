import { describe, expect, it } from 'vitest';
import { ListingSchema, listingKey } from './listing.js';

describe('ListingSchema', () => {
  it('applies defaults', () => {
    const l = ListingSchema.parse({
      source: 'reddit',
      sourceId: 'abc123',
      url: 'https://reddit.com/r/hardwareswap/comments/abc123',
      title: '[USA-CA] [H] iPhone 15 Pro 256GB [W] PayPal',
      price: 650,
      shippingCost: 0,
      seller: { name: 'someone' },
      postedAt: '2026-01-01T00:00:00Z',
    });
    expect(l.currency).toBe('USD');
    expect(l.condition).toBe('unknown');
    expect(l.status).toBe('active');
    expect(l.postedAt).toBeInstanceOf(Date);
    expect(listingKey(l)).toBe('reddit:abc123');
  });

  it('rejects unknown sources', () => {
    expect(() => ListingSchema.parse({ source: 'craigslist' })).toThrow();
  });
});
