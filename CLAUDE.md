# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Mobile app (root)
```bash
npm start              # Expo dev server (scan QR with Expo Go)
npm run android        # Android emulator
npm run ios            # iOS simulator
npm run lint           # ESLint (airbnb-typescript ruleset)
npm run lint:fix       # Auto-fix lint issues
npm run typecheck      # tsc --noEmit
npm test               # Jest (jest-expo preset)
npx jest --testPathPattern=<file>  # Run single test
```

### Cloudflare Worker (workers/)
```bash
npm run dev     # wrangler dev (local Worker)
npm run deploy  # wrangler deploy → production
npm test        # vitest
```

Secret (set once via `wrangler secret put`): `OPENAI_API_KEY`.
Var (in `wrangler.toml`): `SUPABASE_URL` — public project URL used to discover the ES256 JWKS for JWT verification (no shared secret).

## Path Aliases (tsconfig.json)

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `src/*` |
| `@ui/*` | `src/ui/*` |
| `@components/*` | `src/ui/components/*` |
| `@screens/*` | `src/screens/*` |
| `@hooks/*` | `src/hooks/*` |
| `@utils/*` | `src/utils/*` |

## Architecture

**Three-tier:** Expo mobile app → Supabase (auth + Postgres) → Cloudflare Worker (recommendation engine).

```
Mobile (React Native/Expo)
  └── src/utils/api.ts         HTTP client; reads RECOMMEND_API_URL from expo config extra
  └── src/hooks/useSupabase.ts  Supabase client + auth
  └── src/hooks/useRecommendation.ts  Calls Worker POST /recommend

Cloudflare Worker (workers/)
  └── src/index.ts             Hono app; JWT check middleware → /recommend handler
  └── src/recommendation.ts   Pure filtering + scoring logic (no I/O)
  └── src/providers.json       Static provider/model catalog (pricing, capabilities)
  └── src/latency.json         Per-provider regional latency data
```

**Recommendation scoring** (higher = better, top-1 per use case returned):
```
score = normCost*0.5 + normLat*0.3 + normBench*0.2
```
`normCost`/`normLat` are inverted (lower cost/latency → higher score). Budget/latency constraints are soft — if no candidates pass, filters are relaxed.

**SDK snippet generation:** After scoring, `index.ts` makes one OpenAI `gpt-4o-mini` call per recommendation to generate a TypeScript snippet. Failure is non-fatal (placeholder comment returned).

## Navigation

Stack navigator: Welcome → WizardOverview → WizardUseCase → WizardConstraints → WizardSummary → Results → MainTabs.  
MainTabs is a bottom-tab: Home (WelcomeScreen) / Analytics / Settings.  
Type-safe param lists in `src/navigation/RootNavigator.tsx`.

## Known TODOs in code

- ~~`workers/src/index.ts`: JWT signature is **not** verified.~~ Done — `workers/src/auth.ts` verifies the Supabase JWT with **ES256** against the project JWKS (`createRemoteJWKSet`), validating iss/aud=`authenticated`/exp; fails closed (401).
- `src/utils/api.ts`: Supabase JWT is **not** attached to requests (commented out `TODO`).

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):
1. `lint-and-test` — lint + typecheck + jest (all branches)
2. `build-storybook` — parallel storybook export check
3. `deploy-worker` — `wrangler deploy` from `workers/` (main only, after lint-and-test)
4. `supabase-migrations` — `supabase db push` (main only, after lint-and-test)

Worker KV namespace binding: `AI_FIT_KV` — update `id` in `workers/wrangler.toml` before deploy.
