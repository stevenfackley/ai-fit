# CONTRIBUTING.md — AI-Fit

## Getting Started

1. Fork the repository.
2. Clone your fork.
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and fill in your Supabase & OpenAI credentials.
5. Run `npx expo start` to launch the dev server.

## Project Conventions

- **Language:** TypeScript everywhere (`src/` and `workers/src/`)
- **Linting:** ESLint (Airbnb config + TypeScript extensions)
- **Formatting:** Prettier
- **Testing:** Jest for unit tests, React Native Testing Library for components
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)

## Directory Rules

- All React Native source code lives in `/src`.
- All backend code lives in `/workers/src`.
- All database migrations live in `/supabase/migrations`.
- All documentation lives in `/docs` or root markdown files.

## Pull Request Process

1. Create a feature branch from `main`.
2. Write or update tests for any new logic.
3. Ensure `npm run lint` and `npm test` pass.
4. Update relevant docs (`DESIGN.md`, `ARCHITECTURE.md`, etc.) if behavior changes.
5. Open a PR with a clear description and link to any related issues.
6. CI must pass before merge.

## Design Decisions

Any change to branding, palette, component hierarchy, or navigation must be documented in `DESIGN.md` before merging.

## Questions?

Open an issue or reach out in discussions.
