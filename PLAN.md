# Apple Deal Finder — Project Plan

A personal, single-window app that pulls Apple hardware listings (iPhone, iPad, MacBook/Mac, Apple Watch, AirPods, accessories) from many marketplaces into one normalized feed, lets you filter and watch for specific products, and alerts you when something matches your price.

Assumptions (change these if wrong):

- Personal, non-commercial use, running on your own machine (laptop or a small home server).
- US-centric to start (USD, US shipping, r/hardwareswap region tags), extensible later.
- "Singular window" = one web page you open in a browser (or wrap as a desktop app later). No mobile app in scope.

---

## 1. Goals and non-goals

**Goals**

1. One feed, every source: new listings appear within minutes of being posted.
2. Normalized data: every listing has the same fields (product, model, storage, condition, price, shipping, location, seller, link) regardless of where it came from.
3. Filtering and saved searches: "MacBook Air M2/M3, 16GB, under $700, shipped."
4. Alerts: get notified (desktop/phone) the moment a saved search matches, because the good hardwareswap deals go in minutes.
5. Deal signal: a rough "is this a good price?" indicator based on recent asking/sold prices for the same product.

**Non-goals (for now)**

- Automatic buying, bidding, or messaging sellers.
- Sources that actively forbid and block automated access (Facebook Marketplace, OfferUp). We can revisit if a sanctioned route appears.
- Multi-user / hosted SaaS. This is a single-user tool.

---

## 2. Sources

Ranked by value and how practical the access is. Each source is an isolated **adapter** behind a feature flag, so a broken or risky source never takes the app down.

| Tier | Source | Access method | Notes |
|---|---|---|---|
| 1 | r/hardwareswap, r/appleswap | Reddit OAuth API (`/r/<sub>/new`, `/r/<sub>/search`) | Free tier is fine for one user (≤100 req/min). Must register a "script" app, send a descriptive User-Agent, respect rate-limit headers. Titles follow `[USA-CA] [H] iPhone 15 Pro 256GB [W] PayPal` and need parsing. Flair distinguishes SELLING / BUYING / CLOSED. |
| 1 | eBay | eBay Browse API (`item_summary/search`) | Free developer account, OAuth client-credentials. Search by keyword + category + filters (condition, price, buying option, item location). Returns clean structured data. Join eBay Partner Network later if you want affiliate links. |
| 2 | Swappa | Public listing pages (HTML) | Apple-heavy, verified sellers, but no public API. Scrape gently (low frequency, cache, honor robots.txt). Treat as "may break". |
| 2 | Slickdeals (new/refurb deals) | RSS search feeds | Good for new-in-box deals on Apple gear at retailers. Easy to ingest with a feed parser. |
| 2 | Apple Certified Refurbished | Apple refurb store pages | Useful as a **price ceiling** reference and for notable refurb drops. Light scraping; changes rarely. |
| 3 | Woot, Best Buy open-box, Mercari, Back Market | Woot API / Best Buy API (approval needed) / HTML | Add once the core pipeline is solid. Each is a few hours of adapter work. |
| ✗ | Facebook Marketplace, OfferUp, Craigslist | — | No API, scraping violates ToS and is actively blocked. Out of scope. |

**Legal / etiquette rules every adapter follows**

- Prefer official APIs. When scraping, poll no more than every 10–15 minutes, cache aggressively, identify yourself in the User-Agent, and stop on 429/403.
- Never store or redistribute more than you need; keep the raw payload for debugging but treat it as disposable.

---

## 3. Architecture

Keep it small: one process, one SQLite file, one page.

```
┌──────────────────────────────────────────────────────────────┐
│  Scheduler (every N min per source)                          │
│    └─► Source adapters ──► Normalizer/Classifier ──► Dedup   │
│                                                      │       │
│                                                      ▼       │
│                                               SQLite (listings,
│                                               products, watches,
│                                               price_history)  │
│                                                      │       │
│   Alert engine ◄─────────────────────────────────────┤       │
│     └─► ntfy / Discord webhook / OS notification     │       │
│                                                      ▼       │
│   HTTP API (REST + Server-Sent Events) ──► Single-page UI    │
└──────────────────────────────────────────────────────────────┘
```

**Stack recommendation: TypeScript end to end.**

- Runtime: Node 22, pnpm workspace monorepo.
- API/worker: Hono (or Fastify) + `node-cron`/`croner` for scheduling.
- DB: SQLite via Drizzle ORM (zero ops, one file, easy backups, FTS5 for full-text search).
- HTTP/parsing: native `fetch`, `cheerio` for HTML, `fast-xml-parser` for RSS.
- UI: React + Vite + Tailwind, one route. Live updates via SSE.
- Packaging: `docker compose up` for a home server, or wrap the UI in Tauri later for a true native "single window".

Why one language: one toolchain, shared types between adapters and UI, and a trivial path to a desktop wrapper. (Python + FastAPI is an equally fine choice if you prefer it; the plan does not change.)

**Repo layout**

```
apps/
  api/        # scheduler, adapters, alert engine, HTTP API
  web/        # React single-page UI
packages/
  core/       # Listing model, product taxonomy, classifier, dedup, deal scoring
  adapters/   # one folder per source: reddit/, ebay/, swappa/, slickdeals/, ...
```

---

## 4. Data model

```ts
Listing {
  id              // internal
  source          // 'reddit' | 'ebay' | 'swappa' | ...
  sourceId        // post id / item id (unique per source)
  url
  title
  body?           // post text / item description (trimmed)
  price           // numeric, USD; null if "offers only"
  shippingCost?   // 0 = free, null = unknown / local only
  currency
  condition       // 'new' | 'open-box' | 'refurb' | 'used' | 'for-parts' | 'unknown'
  listingType     // 'fixed' | 'auction' | 'offer'
  location?       // "USA-CA", city, or country
  seller          // { name, url?, rating?, tradeCount?, accountAgeDays? }
  product         // { category, family, model, storage, color?, year?, chip? }  ← from classifier
  images[]
  postedAt, fetchedAt, lastSeenAt
  status          // 'active' | 'sold' | 'removed' | 'expired'
  dealScore?      // -1..1, see §7
  raw             // original payload (JSON), for re-parsing later
}

Watch {   // a saved search / alert rule
  id, name, enabled
  query           // free text, optional
  categories[]    // iPhone, MacBook, ...
  models[]        // e.g. ["iPhone 15 Pro", "iPhone 15 Pro Max"]
  minStorageGb?, maxPrice?, conditions[], sources[], shippedOnly?
  notifyVia[]     // 'ntfy' | 'discord' | 'desktop'
}

PriceObservation { productKey, price, condition, source, observedAt, kind: 'ask' | 'sold' }
```

**Product taxonomy** (`packages/core/taxonomy`): a hand-maintained table of Apple products (family → model → chips/years → storage options). The classifier maps a messy title to a `productKey` like `iphone-15-pro/256gb` or `macbook-air-13-m2/16gb-512gb`. This table is the heart of filtering and deal scoring, so it gets its own tests.

---

## 5. Processing pipeline

1. **Fetch** — each adapter returns `RawListing[]`. Reddit: pull `/new` and a keyword search for both subs; keep only SELLING flair with Apple terms in the `[H]` segment. eBay: one search per watched product family (keeps call count small), categories limited to phones/laptops/watches/headphones.
2. **Normalize** — map to `Listing`. Parse prices from text (`$650 shipped`, `650 + shipping`, `OBO`), hardwareswap region tags, storage sizes, conditions.
3. **Classify** — rules-first (regex + synonym table: "MBA" → MacBook Air, "AW" → Apple Watch, "APP2" → AirPods Pro 2). Unmatched titles go to an "uncategorized" bucket you can review. Optional later: an LLM call for the hard cases only.
4. **Dedup** — primary key `(source, sourceId)`; update `lastSeenAt` and price changes instead of inserting twice. Cross-post detection (same user, same title on two subs) via a normalized-title hash.
5. **Lifecycle** — mark `sold`/`removed` when a Reddit post flips to CLOSED or disappears, or an eBay item ends. Expire after 14 days without being seen.
6. **Score** — compute `dealScore` from price history (§7).
7. **Alert** — evaluate every new/changed listing against all `Watch` rules; de-bounce so one listing never pings twice.
8. **Publish** — push to UI via SSE.

---

## 6. UI (the single window)

- **Left rail:** saved watches (click to filter), source toggles, category chips.
- **Main feed:** card or compact row per listing: thumbnail, product name, price (+ shipping), condition, source badge, location, age ("4 min"), deal badge (🔥 / fair / high). Sort by newest or best deal. Infinite scroll.
- **Top bar:** search box with quick syntax (`macbook air m2 <700 shipped`), "live" indicator, unread-since-last-visit counter.
- **Detail drawer:** full text, images, seller trust info (trade count / feedback / account age), price history sparkline for that product, "Open on source" button.
- **Settings:** API keys, poll intervals, notification channels, quiet hours.

---

## 7. Deal scoring

Start simple and get smarter:

1. **v1:** rolling 30-day median asking price per `productKey` + condition across all sources. `dealScore = (median − price) / median`, clipped. Badge thresholds: ≥15% below → 🔥, ±15% → fair, >15% above → high.
2. **v2:** add sold prices. eBay's Marketplace Insights API gives sold data but requires approval; until then, record hardwareswap posts that flip to CLOSED at their last asking price as a proxy for sold.
3. **v3:** use Apple refurb and retailer prices as a ceiling so a "used" listing above refurb price is always flagged.
4. Always allow manual overrides ("I know a good price for this is $X").

---

## 8. Alerts

- Channels: **ntfy.sh** (free push to phone, trivial to set up), **Discord webhook**, and native desktop notifications when running locally.
- Each `Watch` chooses its channels. Rate-limit to avoid floods (e.g., max 1 notification per listing, batch if >5 in a minute).
- Message format: `🔥 $620 shipped — MacBook Air M2 16/512 (r/hardwareswap, 2 min ago) → link`.

---

## 9. Phased delivery

| Phase | Scope | Done when |
|---|---|---|
| **0 — Scaffold** (½ day) | Monorepo, lint/test/CI, `.env` handling, SQLite + migrations, `Listing` + taxonomy types, register Reddit and eBay developer apps. | `pnpm dev` runs an empty API + UI. |
| **1 — MVP feed** (2–3 days) | Reddit (hardwareswap, appleswap) + eBay adapters; normalizer; classifier v1; manual "refresh" button; feed UI with text/category/price filters. | You can open one page and see Apple listings from both sources with working filters. |
| **2 — Live pipeline** (1–2 days) | Scheduler, dedup, lifecycle (sold/removed), SSE live updates, FTS search. | Feed updates itself; sold items drop out. |
| **3 — Watches & alerts** (1–2 days) | `Watch` CRUD in UI, rule engine, ntfy + Discord + desktop notifications, quiet hours. | A new matching hardwareswap post pings your phone within ~5 min. |
| **4 — More sources** (½–1 day each) | Swappa, Slickdeals RSS, Apple refurb, then Woot / Best Buy / Mercari as desired. | Each adapter has tests against saved fixtures and a feature flag. |
| **5 — Deal scoring** (1–2 days) | Price history table, rolling medians, badges, per-product sparkline, manual overrides. | Every classified listing shows a defensible 🔥/fair/high badge. |
| **6 — Polish & packaging** (1–2 days) | Docker compose, backups of the SQLite file, Tauri desktop wrapper (optional), seller-trust hints (new account / low trade count warnings), error dashboard for adapters. | Runs unattended on a home server for a week without intervention. |

Phases 1–3 give you a genuinely useful tool. Everything after is incremental.

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Reddit/eBay change API terms or rate limits | Adapters are isolated; back off automatically on 429; keep polling well under free-tier limits. |
| Scraped sources (Swappa etc.) break or block | Fixture-based tests catch parser breakage; a failing adapter is disabled automatically and surfaced in the error dashboard, never crashes the app. |
| Misclassified products pollute filters and scoring | Rules-first classifier with a reviewable "uncategorized" bucket; taxonomy tests; easy manual re-tag in UI. |
| Scams on swap subreddits | Show account age, confirmed-trade count, and flag posts from new/low-karma accounts. The app never transacts. |
| Alert fatigue | Per-watch channels, de-bouncing, quiet hours, "fair or better only" toggle. |
| Credential leakage | Keys live in `.env` (gitignored) or OS keychain; never in the repo. |

---

## 11. First concrete steps

1. Register a Reddit "script" app and an eBay developer app; put the keys in `.env`.
2. Scaffold the monorepo (Phase 0).
3. Build the Reddit adapter first, with ~20 saved real post titles as test fixtures for the parser.
4. Build the eBay adapter against the Browse API sandbox, then production.
5. Ship the feed page and start using it daily while Phases 2–3 land.
