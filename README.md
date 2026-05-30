# AI-Fit

**Your AI-to-app fitting service.**

AI-Fit is a mobile-first React Native application that helps developers and teams discover the best AI model (and provider) for every part of their project. Users describe their idea, set constraints, and receive data-driven recommendations with cost estimates, code snippets, and exportable configuration.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

Scan the QR code with the Expo Go app (iOS / Android) to preview.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native (Expo managed) |
| UI Kit | NativeBase + NativeWind |
| Navigation | React Navigation |
| Forms | React Hook Form + Zod |
| Auth & DB | Supabase (Auth + PostgreSQL) |
| Backend | Cloudflare Workers (TypeScript) |
| LLM | OpenAI gpt-4o-mini |
| CI/CD | GitHub Actions |

---

## Project Structure

```
/ai-fit
├── src/                 # React Native source
├── workers/             # Cloudflare Workers backend
├── supabase/            # Migrations & config
├── docs/                # Guides & specs
└── .github/workflows/   # CI/CD
```

All source code lives in `/src`.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT
