# DESIGN.md — AI-Fit Design Decisions

## Product Identity

- **Name:** AI-Fit
- **Tagline:** "Your AI-to-app fitting service."
- **Mood:** Clean, trustworthy, developer-friendly.

## Color Palette

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| Primary | `#3B82F6` (blue-500) | `#2563EB` (blue-600) |
| Secondary | `#10B981` (green-500) | `#059669` (green-600) |
| Accent / Warning | `#F59E0B` (amber-500) | `#D97706` (amber-600) |
| Background | `#F9FAFB` (gray-50) | `#111827` (gray-900) |
| Card Surface | `#FFFFFF` | `#1F2937` (gray-800) |
| Body Text | `#1F2937` (gray-800) | `#E5E7EB` (gray-200) |
| Muted Text | `#6B7280` (gray-500) | `#9CA3AF` (gray-400) |

*All colors map to Tailwind utility classes consumed by NativeWind.*

## Typography

- **Font family:** Inter (system-font fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`)
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Base size:** 16px
- **Scale:**
  - `xs` 12px
  - `sm` 14px
  - `base` 16px
  - `lg` 18px
  - `xl` 20px
  - `2xl` 24px
  - `3xl` 30px

## Spacing

- 4px grid (Tailwind `space-1` = 0.25rem)
- Card radius: 0.5rem (`rounded-lg`)
- Card shadow: `shadow-md` (light), `shadow-lg` (dark)

## Component Hierarchy

```
AppShell
├── Header
│   ├── AppName
│   └── DarkModeToggle
├── AnalyticsBanner (collapsible)
└── Navigator
    ├── WelcomeScreen
    ├── WizardStack
    │   ├── OverviewStep
    │   ├── UseCaseStep
    │   ├── ConstraintsStep
    │   └── SummaryStep
    ├── ResultsScreen
    ├── SettingsScreen
    └── AnalyticsScreen
```

## Accessibility

- Minimum touch target: 44×44 dp
- Color contrast ratio ≥ 4.5:1 for body text
- All interactive elements include `accessibilityLabel` and `accessibilityRole`
- Dark mode toggle persists via AsyncStorage
- Light mode is the default

## Icons

- **Library:** Phosphor Icons
- **Style:** Outline (light mode), Fill (dark mode)
- **Size:** 24px default, 20px for inline

## Navigation

- Primary: Stack navigator for wizard flow
- Secondary: Bottom-tab navigator for Home, Saved, Settings

## Screens

### WelcomeScreen
- Large brand mark + tagline
- "Get Started" CTA button

### Wizard (4 steps)
1. **OverviewStep** — Multiline text input for project description
2. **UseCaseStep** — Multi-select chip group (Chat, Code-assist, Image gen, Embeddings, Search, Function calling)
3. **ConstraintsStep** — Sliders for budget & latency, toggles for compliance, provider checkboxes
4. **SummaryStep** — Review answers before submit

### ResultsScreen
- Card-based dashboard
- Each card: provider badge, model name, capability icons, reasoning bullets, estimated cost, copy-ready SDK snippet
- Export button (JSON / YAML)

### SettingsScreen
- API key management (secure storage)
- Dark mode toggle
- Saved projects list

### AnalyticsScreen
- Weekly recommendation count bar chart
- Cost summary of saved configs

## Design Tokens

Stored in `src/ui/theme/tokens.json` and consumed by `nativebaseTheme.ts`.
