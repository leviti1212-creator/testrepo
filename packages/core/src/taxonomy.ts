/**
 * Hand-maintained Apple product taxonomy. The classifier maps messy titles
 * onto `productKey`s from this table; deal scoring groups prices by them.
 *
 * Keep entries in release order within a family. `aliases` are lowercase
 * substrings that strongly indicate the model (checked longest-first).
 */

export const CATEGORIES = ['iphone', 'ipad', 'mac', 'watch', 'airpods', 'accessory'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface ProductDef {
  productKey: string;
  category: Category;
  family: string;
  model: string;
  year: number;
  chip?: string;
  storageOptionsGb?: number[];
  aliases: string[];
}

const iphone = (
  model: string,
  year: number,
  key: string,
  aliases: string[],
  storage: number[],
): ProductDef => ({
  productKey: key,
  category: 'iphone',
  family: 'iPhone',
  model,
  year,
  storageOptionsGb: storage,
  aliases: [model.toLowerCase(), ...aliases],
});

export const PRODUCTS: ProductDef[] = [
  // --- iPhone ---
  iphone('iPhone 13', 2021, 'iphone-13', ['iphone13'], [128, 256, 512]),
  iphone('iPhone 13 mini', 2021, 'iphone-13-mini', ['iphone 13 mini', '13 mini'], [128, 256, 512]),
  iphone('iPhone 13 Pro', 2021, 'iphone-13-pro', ['13 pro'], [128, 256, 512, 1024]),
  iphone(
    'iPhone 13 Pro Max',
    2021,
    'iphone-13-pro-max',
    ['13 pro max', '13pm'],
    [128, 256, 512, 1024],
  ),
  iphone('iPhone 14', 2022, 'iphone-14', ['iphone14'], [128, 256, 512]),
  iphone('iPhone 14 Plus', 2022, 'iphone-14-plus', ['14 plus'], [128, 256, 512]),
  iphone('iPhone 14 Pro', 2022, 'iphone-14-pro', ['14 pro'], [128, 256, 512, 1024]),
  iphone(
    'iPhone 14 Pro Max',
    2022,
    'iphone-14-pro-max',
    ['14 pro max', '14pm'],
    [128, 256, 512, 1024],
  ),
  iphone('iPhone 15', 2023, 'iphone-15', ['iphone15'], [128, 256, 512]),
  iphone('iPhone 15 Plus', 2023, 'iphone-15-plus', ['15 plus'], [128, 256, 512]),
  iphone('iPhone 15 Pro', 2023, 'iphone-15-pro', ['15 pro'], [128, 256, 512, 1024]),
  iphone('iPhone 15 Pro Max', 2023, 'iphone-15-pro-max', ['15 pro max', '15pm'], [256, 512, 1024]),
  iphone('iPhone 16', 2024, 'iphone-16', ['iphone16'], [128, 256, 512]),
  iphone('iPhone 16 Plus', 2024, 'iphone-16-plus', ['16 plus'], [128, 256, 512]),
  iphone('iPhone 16 Pro', 2024, 'iphone-16-pro', ['16 pro'], [128, 256, 512, 1024]),
  iphone('iPhone 16 Pro Max', 2024, 'iphone-16-pro-max', ['16 pro max', '16pm'], [256, 512, 1024]),
  iphone('iPhone 16e', 2025, 'iphone-16e', ['16e'], [128, 256, 512]),

  // --- Mac ---
  {
    productKey: 'macbook-air-13-m1',
    category: 'mac',
    family: 'MacBook Air',
    model: 'MacBook Air 13" M1',
    year: 2020,
    chip: 'M1',
    aliases: ['macbook air m1', 'mba m1', 'm1 air', 'm1 macbook air'],
  },
  {
    productKey: 'macbook-air-13-m2',
    category: 'mac',
    family: 'MacBook Air',
    model: 'MacBook Air 13" M2',
    year: 2022,
    chip: 'M2',
    aliases: ['macbook air m2', 'mba m2', 'm2 air', 'm2 macbook air'],
  },
  {
    productKey: 'macbook-air-15-m2',
    category: 'mac',
    family: 'MacBook Air',
    model: 'MacBook Air 15" M2',
    year: 2023,
    chip: 'M2',
    aliases: ['15" macbook air m2', '15 inch macbook air m2', 'mba 15 m2'],
  },
  {
    productKey: 'macbook-air-13-m3',
    category: 'mac',
    family: 'MacBook Air',
    model: 'MacBook Air 13" M3',
    year: 2024,
    chip: 'M3',
    aliases: ['macbook air m3', 'mba m3', 'm3 air', 'm3 macbook air'],
  },
  {
    productKey: 'macbook-air-15-m3',
    category: 'mac',
    family: 'MacBook Air',
    model: 'MacBook Air 15" M3',
    year: 2024,
    chip: 'M3',
    aliases: ['15" macbook air m3', '15 inch macbook air m3', 'mba 15 m3'],
  },
  {
    productKey: 'macbook-air-13-m4',
    category: 'mac',
    family: 'MacBook Air',
    model: 'MacBook Air 13" M4',
    year: 2025,
    chip: 'M4',
    aliases: ['macbook air m4', 'mba m4', 'm4 air', 'm4 macbook air'],
  },
  {
    productKey: 'macbook-air-15-m4',
    category: 'mac',
    family: 'MacBook Air',
    model: 'MacBook Air 15" M4',
    year: 2025,
    chip: 'M4',
    aliases: ['15" macbook air m4', '15 inch macbook air m4', 'mba 15 m4'],
  },
  {
    productKey: 'macbook-pro-14-m1-pro',
    category: 'mac',
    family: 'MacBook Pro',
    model: 'MacBook Pro 14" M1 Pro/Max',
    year: 2021,
    chip: 'M1 Pro',
    aliases: ['14" m1 pro', '14 m1 pro', 'm1 pro 14', 'm1 max 14', 'mbp 14 m1'],
  },
  {
    productKey: 'macbook-pro-16-m1-pro',
    category: 'mac',
    family: 'MacBook Pro',
    model: 'MacBook Pro 16" M1 Pro/Max',
    year: 2021,
    chip: 'M1 Pro',
    aliases: ['16" m1 pro', '16 m1 pro', 'm1 pro 16', 'm1 max 16', 'mbp 16 m1'],
  },
  {
    productKey: 'macbook-pro-14-m2-pro',
    category: 'mac',
    family: 'MacBook Pro',
    model: 'MacBook Pro 14" M2 Pro/Max',
    year: 2023,
    chip: 'M2 Pro',
    aliases: ['14" m2 pro', '14 m2 pro', 'm2 pro 14', 'm2 max 14', 'mbp 14 m2'],
  },
  {
    productKey: 'macbook-pro-16-m2-pro',
    category: 'mac',
    family: 'MacBook Pro',
    model: 'MacBook Pro 16" M2 Pro/Max',
    year: 2023,
    chip: 'M2 Pro',
    aliases: ['16" m2 pro', '16 m2 pro', 'm2 pro 16', 'm2 max 16', 'mbp 16 m2'],
  },
  {
    productKey: 'macbook-pro-14-m3',
    category: 'mac',
    family: 'MacBook Pro',
    model: 'MacBook Pro 14" M3/Pro/Max',
    year: 2023,
    chip: 'M3',
    aliases: ['14" m3', '14 m3', 'm3 pro 14', 'm3 max 14', 'mbp 14 m3', 'macbook pro m3'],
  },
  {
    productKey: 'macbook-pro-16-m3',
    category: 'mac',
    family: 'MacBook Pro',
    model: 'MacBook Pro 16" M3 Pro/Max',
    year: 2023,
    chip: 'M3 Pro',
    aliases: ['16" m3', '16 m3', 'm3 pro 16', 'm3 max 16', 'mbp 16 m3'],
  },
  {
    productKey: 'macbook-pro-14-m4',
    category: 'mac',
    family: 'MacBook Pro',
    model: 'MacBook Pro 14" M4/Pro/Max',
    year: 2024,
    chip: 'M4',
    aliases: ['14" m4', '14 m4', 'm4 pro 14', 'm4 max 14', 'mbp 14 m4', 'macbook pro m4'],
  },
  {
    productKey: 'macbook-pro-16-m4',
    category: 'mac',
    family: 'MacBook Pro',
    model: 'MacBook Pro 16" M4 Pro/Max',
    year: 2024,
    chip: 'M4 Pro',
    aliases: ['16" m4', '16 m4', 'm4 pro 16', 'm4 max 16', 'mbp 16 m4'],
  },
  {
    productKey: 'mac-mini-m2',
    category: 'mac',
    family: 'Mac mini',
    model: 'Mac mini M2/M2 Pro',
    year: 2023,
    chip: 'M2',
    aliases: ['mac mini m2', 'm2 mac mini', 'm2 mini'],
  },
  {
    productKey: 'mac-mini-m4',
    category: 'mac',
    family: 'Mac mini',
    model: 'Mac mini M4/M4 Pro',
    year: 2024,
    chip: 'M4',
    aliases: ['mac mini m4', 'm4 mac mini', 'm4 mini'],
  },
  {
    productKey: 'mac-studio-m2',
    category: 'mac',
    family: 'Mac Studio',
    model: 'Mac Studio M2 Max/Ultra',
    year: 2023,
    chip: 'M2 Max',
    aliases: ['mac studio m2', 'm2 mac studio'],
  },
  {
    productKey: 'mac-studio-m4',
    category: 'mac',
    family: 'Mac Studio',
    model: 'Mac Studio M4 Max/M3 Ultra',
    year: 2025,
    chip: 'M4 Max',
    aliases: ['mac studio m4', 'm4 mac studio', 'm3 ultra'],
  },
  {
    productKey: 'imac-24-m3',
    category: 'mac',
    family: 'iMac',
    model: 'iMac 24" M3',
    year: 2023,
    chip: 'M3',
    aliases: ['imac m3', 'm3 imac'],
  },
  {
    productKey: 'imac-24-m4',
    category: 'mac',
    family: 'iMac',
    model: 'iMac 24" M4',
    year: 2024,
    chip: 'M4',
    aliases: ['imac m4', 'm4 imac'],
  },

  // --- iPad ---
  {
    productKey: 'ipad-10',
    category: 'ipad',
    family: 'iPad',
    model: 'iPad (10th gen)',
    year: 2022,
    aliases: ['ipad 10th', 'ipad 10 gen', 'ipad (10th'],
  },
  {
    productKey: 'ipad-11',
    category: 'ipad',
    family: 'iPad',
    model: 'iPad (A16)',
    year: 2025,
    aliases: ['ipad a16', 'ipad 11th'],
  },
  {
    productKey: 'ipad-mini-6',
    category: 'ipad',
    family: 'iPad mini',
    model: 'iPad mini (6th gen)',
    year: 2021,
    aliases: ['ipad mini 6', 'mini 6th'],
  },
  {
    productKey: 'ipad-mini-7',
    category: 'ipad',
    family: 'iPad mini',
    model: 'iPad mini (A17 Pro)',
    year: 2024,
    aliases: ['ipad mini 7', 'ipad mini a17', 'mini 7th'],
  },
  {
    productKey: 'ipad-air-m2',
    category: 'ipad',
    family: 'iPad Air',
    model: 'iPad Air M2',
    year: 2024,
    chip: 'M2',
    aliases: ['ipad air m2', 'm2 ipad air', 'm2 air 11', 'm2 air 13'],
  },
  {
    productKey: 'ipad-air-m3',
    category: 'ipad',
    family: 'iPad Air',
    model: 'iPad Air M3',
    year: 2025,
    chip: 'M3',
    aliases: ['ipad air m3', 'm3 ipad air'],
  },
  {
    productKey: 'ipad-pro-m2',
    category: 'ipad',
    family: 'iPad Pro',
    model: 'iPad Pro M2',
    year: 2022,
    chip: 'M2',
    aliases: ['ipad pro m2', 'm2 ipad pro'],
  },
  {
    productKey: 'ipad-pro-m4',
    category: 'ipad',
    family: 'iPad Pro',
    model: 'iPad Pro M4',
    year: 2024,
    chip: 'M4',
    aliases: ['ipad pro m4', 'm4 ipad pro'],
  },

  // --- Apple Watch ---
  {
    productKey: 'apple-watch-se-2',
    category: 'watch',
    family: 'Apple Watch SE',
    model: 'Apple Watch SE (2nd gen)',
    year: 2022,
    aliases: ['watch se 2', 'se 2nd gen', 'aw se'],
  },
  {
    productKey: 'apple-watch-s8',
    category: 'watch',
    family: 'Apple Watch',
    model: 'Apple Watch Series 8',
    year: 2022,
    aliases: ['series 8', 'aw8', 's8 watch'],
  },
  {
    productKey: 'apple-watch-s9',
    category: 'watch',
    family: 'Apple Watch',
    model: 'Apple Watch Series 9',
    year: 2023,
    aliases: ['series 9', 'aw9', 's9 watch'],
  },
  {
    productKey: 'apple-watch-s10',
    category: 'watch',
    family: 'Apple Watch',
    model: 'Apple Watch Series 10',
    year: 2024,
    aliases: ['series 10', 'aw10', 's10 watch'],
  },
  {
    productKey: 'apple-watch-ultra-1',
    category: 'watch',
    family: 'Apple Watch Ultra',
    model: 'Apple Watch Ultra',
    year: 2022,
    aliases: ['watch ultra 1', 'ultra 1'],
  },
  {
    productKey: 'apple-watch-ultra-2',
    category: 'watch',
    family: 'Apple Watch Ultra',
    model: 'Apple Watch Ultra 2',
    year: 2023,
    aliases: ['watch ultra 2', 'ultra 2'],
  },

  // --- AirPods ---
  {
    productKey: 'airpods-3',
    category: 'airpods',
    family: 'AirPods',
    model: 'AirPods (3rd gen)',
    year: 2021,
    aliases: ['airpods 3', 'airpods 3rd'],
  },
  {
    productKey: 'airpods-4',
    category: 'airpods',
    family: 'AirPods',
    model: 'AirPods 4',
    year: 2024,
    aliases: ['airpods 4', 'airpods 4th'],
  },
  {
    productKey: 'airpods-pro-2',
    category: 'airpods',
    family: 'AirPods Pro',
    model: 'AirPods Pro (2nd gen)',
    year: 2022,
    aliases: ['airpods pro 2', 'airpods pro 2nd', 'app2', 'app 2'],
  },
  {
    productKey: 'airpods-max',
    category: 'airpods',
    family: 'AirPods Max',
    model: 'AirPods Max',
    year: 2020,
    aliases: ['airpods max', 'apm'],
  },
];

const byKey = new Map(PRODUCTS.map((p) => [p.productKey, p]));

export function getProduct(productKey: string): ProductDef | undefined {
  return byKey.get(productKey);
}

export function productsInCategory(category: Category): ProductDef[] {
  return PRODUCTS.filter((p) => p.category === category);
}

/** Generic category hints, used when no specific model matches. */
export const CATEGORY_HINTS: Record<Category, string[]> = {
  iphone: ['iphone'],
  ipad: ['ipad'],
  mac: ['macbook', 'mac mini', 'mac studio', 'imac', 'mac pro', 'mbp', 'mba'],
  watch: ['apple watch', 'watch ultra', 'watch se', 'series '],
  airpods: ['airpods', 'air pods'],
  accessory: [
    'magsafe',
    'apple pencil',
    'magic keyboard',
    'magic mouse',
    'studio display',
    'airtag',
    'homepod',
    'apple tv',
  ],
};
