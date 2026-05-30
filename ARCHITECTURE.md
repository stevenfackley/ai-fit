# ARCHITECTURE.md — AI-Fit System Architecture

## High-Level Diagram

```
┌─────────────────┐
│   Mobile App    │  React Native (Expo)
│   AI-Fit        │
└────────┬────────┘
         │ HTTPS / JWT
         ▼
┌─────────────────┐
│   Supabase      │  Auth + PostgreSQL
│   (Auth + DB)   │  profiles, projects, recommendations
└────────┬────────┘
         │ Bearer Token
         ▼
┌─────────────────┐
│ Cloudflare      │  TypeScript Worker
│ Worker          │  POST /recommend
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ OpenAI │ │Anthropic│
│ API    │ │ API     │
└────────┘ └────────┘
```

## Component Boundaries

### Frontend (React Native)
- **Presentation:** NativeBase components styled with NativeWind
- **State:** React Hook Form (wizard), React Navigation (routing), AsyncStorage (theme preference)
- **Data Access:** Custom hooks (`useSupabase`, `useRecommendation`)

### Backend (Cloudflare Worker)
- **Entry:** `index.ts` — validates JWT, routes to recommendation engine
- **Core Logic:** `recommendation.ts` — pure functions for filtering, scoring, ranking
- **Data:** Static JSON files (`providers.json`, `latency.json`) bundled with the Worker
- **LLM Calls:** OpenAI SDK (gpt-4o-mini) for SDK snippet generation

### Persistence (Supabase)
- **Auth:** OAuth + magic link
- **Tables:** `profiles`, `projects`, `recommendations`, `usage_logs`
- **RLS:** Users can only read/write their own rows

## Data Flow

1. User fills wizard → form state stored locally
2. On submit, app sends JSON payload + JWT to Worker `/recommend`
3. Worker:
   - Validates JWT
   - Loads provider matrix & latency table
   - Filters models by capabilities & compliance
   - Estimates cost & latency
   - Scores candidates (cost 0.5, latency 0.3, benchmark 0.2)
   - Generates SDK snippets via OpenAI gpt-4o-mini
   - Returns ranked recommendations
4. App renders result cards
5. User can save project → stored in Supabase

## Scoring Algorithm

```
score = (normalizedCost * 0.5) + (normalizedLatency * 0.3) + (normalizedBenchmark * 0.2)
```

Lower score = better recommendation (cost & latency are minimized, benchmark is maximized).

## Security

- API keys for OpenAI/Anthropic stored in Worker Secrets (never client-side)
- Supabase JWT required for `/recommend` endpoint
- Row-Level Security on all user tables
- HTTPS only

## Future Web Endpoint

Because NativeBase + NativeWind target React Native Web, the same `/src` code can be compiled to a web app (Expo Web or Next.js) with minimal changes. The Worker API remains unchanged.
