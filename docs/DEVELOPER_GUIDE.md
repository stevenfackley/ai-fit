# Developer Guide — AI-Fit

## Prerequisites

- Node.js 22+
- npm 10+
- Expo CLI (`npm i -g expo-cli`)
- Supabase CLI (`npm i -g supabase`)
- Wrangler (`npm i -g wrangler`)
- Git

## Local Setup

### 1. Mobile App

```bash
cd ai-fit
npm install
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

### 2. Supabase

```bash
supabase login
supabase init
supabase start        # local stack
supabase db reset     # apply migrations
```

Copy the local Supabase URL and anon key into `.env`.

### 3. Cloudflare Worker

```bash
cd workers
npm install
wrangler login
wrangler dev          # local dev server
```

Add secrets:
```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put SUPABASE_JWT_SECRET
```

### 4. Environment Variables

Copy `.env.example` to `.env` and fill:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
RECOMMEND_API_URL=https://your-worker.your-subdomain.workers.dev
```

## Running Tests

```bash
# Unit tests (Jest)
npm test

# Component tests
npm run test:components

# Worker tests
cd workers && npm test
```

## Lint & Format

```bash
npm run lint
npm run format
```

## Deploying

### Worker
```bash
cd workers
wrangler publish
```

### Supabase Migrations
```bash
supabase db push
```

### Mobile
```bash
eas build --platform all
```

Or for web preview:
```bash
expo export:web
```

## LLM Integration

The Worker uses OpenAI `gpt-4o-mini` to generate SDK snippets. Ensure `OPENAI_API_KEY` is set as a Worker secret. Calls are made server-side only.

## Troubleshooting

- **Metro bundler errors:** Clear cache with `npx expo start -c`
- **Worker 401:** Verify JWT secret matches Supabase config
- **Supabase RLS issues:** Check policies in `supabase/migrations/001_initial.sql`
