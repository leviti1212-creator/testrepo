# Apple Deal Finder

One window for Apple hardware deals from r/hardwareswap, r/appleswap, eBay, and more. See [PLAN.md](./PLAN.md) for the full design and phased roadmap.

## Status

Phase 0 (scaffold) is done: monorepo, SQLite schema + migrations, API with SSE, empty UI shell, CI. No source adapters yet, so the feed is empty until Phase 1 lands.

## Layout

```
apps/api           Hono API + scheduler + SQLite (Drizzle)
apps/web           React + Vite + Tailwind single-page UI
packages/core      Listing model, product taxonomy, SourceAdapter contract
packages/adapters  One folder per marketplace (reddit/, ebay/, ...)
```

## Setup

Requires Node 22+ and pnpm 10 (`corepack enable`).

```sh
pnpm install
cp .env.example .env     # fill in Reddit / eBay keys when you have them
pnpm dev                 # API on :3000, UI on :5173 (proxies /api to the API)
```

Other commands:

```sh
pnpm test          # vitest across all packages
pnpm typecheck
pnpm lint          # biome; `pnpm lint:fix` to auto-format
pnpm build
pnpm db:generate   # after editing apps/api/src/db/schema.ts
pnpm db:migrate    # migrations also run automatically on API start
```

## Getting API keys

- **Reddit:** <https://www.reddit.com/prefs/apps> → "create app" → type **script**. Copy the client id (shown under the app name) and the secret into `.env`. Set a descriptive `REDDIT_USER_AGENT`.
- **eBay:** <https://developer.ebay.com/my/keys> → create a production keyset. Copy the App ID (client id) and Cert ID (client secret) into `.env`.

The SQLite file lives at `data/adf.db` (gitignored). Delete it to start fresh.
