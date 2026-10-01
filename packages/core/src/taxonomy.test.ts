import { describe, expect, it } from 'vitest';
import { getProduct, PRODUCTS, productsInCategory } from './taxonomy.js';

describe('taxonomy', () => {
  it('has unique product keys', () => {
    const keys = PRODUCTS.map((p) => p.productKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('uses lowercase aliases only', () => {
    for (const p of PRODUCTS) {
      for (const a of p.aliases) expect(a).toBe(a.toLowerCase());
    }
  });

  it('looks up by key and category', () => {
    expect(getProduct('iphone-15-pro')?.family).toBe('iPhone');
    expect(productsInCategory('airpods').length).toBeGreaterThan(0);
  });
});
