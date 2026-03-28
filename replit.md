# HappySpend Workspace

## Overview

HappySpend is a PWA budgeting app built around identity transformation. Users choose a financial persona and log spending to prove they're becoming better with money. The app never uses guilt or red colors — overspending is always framed as neutral, actionable data.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite PWA, Tailwind CSS, React Query, framer-motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   ├── src/domain/     # Pure business logic (no DB, no Express)
│   │   │   ├── persona/    # personaProgress.ts, milestones.ts
│   │   │   └── budget/     # categoryStatus.ts, weeklySummary.ts
│   │   ├── src/adapters/repositories/  # DB layer only
│   │   ├── src/routes/     # Thin route handlers
│   │   └── src/middlewares/auth.ts  # JWT auth middleware
│   └── happyspend/         # React PWA frontend
│       ├── src/pages/      # auth, onboarding, dashboard, entries, summary, profile
│       └── src/components/ # ui-elements, layout, log-entry-drawer
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/     # users, personas, budgetCategories, budgetEntries, milestones, weeklySummaries
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Key Design Principles

1. **Domain logic in one place**: `/domain` has pure functions for persona progress, milestone evaluation, category status, and weekly summary generation
2. **Commands and queries separate**: commands change data (return nothing), queries read data
3. **Database layer isolated**: repositories in `/adapters/repositories` only read/write rows
4. **Routes are thin**: parse request → call command/query → return result
5. **No guilt framing**: overspending = slate/neutral color, always reframed as data ("R50 more than planned this week. That's useful to know. You can adjust next week.")

## Auth

JWT-based. Token stored in localStorage as `happyspend_token`. `SESSION_SECRET` env var used as JWT secret.

## The Four Personas

- `steady-builder`: The Steady Builder — Calm, consistent, no drama
- `intentional-spender`: The Intentional Spender — Live fully. Spend deliberately
- `freedom-seeker`: The Freedom Seeker — Budgeting is the price of the life you want
- `debt-slayer`: The Debt Slayer — Focused. Strategic. Temporary

## Database Schema

- `users` — email, passwordHash, name, personaId, onboardingComplete
- `personas` — seeded on startup, 4 personas with milestoneThresholds JSONB
- `budget_categories` — user-created, name, monthlyBudget, colour, icon
- `budget_entries` — amount, description, inputMethod (voice/photo/manual), entryDate
- `milestones` — achieved milestone keys per user
- `weekly_summaries` — cached weekly summary JSONB

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate React Query hooks and Zod schemas

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes: auth, onboarding, personas, categories, entries, dashboard, summaries, milestones.
Auth: bcryptjs + jsonwebtoken. Personas seeded on startup.

### `artifacts/happyspend` (`@workspace/happyspend`)

React PWA. Mobile-first, single-column. Pages: Auth, Onboarding (3-step), Dashboard, Entries, Summary, Profile.
Animations via framer-motion. Forms via react-hook-form. Icons via lucide-react.

### `lib/db` (`@workspace/db`)

Drizzle ORM schema + DB connection.
- `pnpm --filter @workspace/db run push` — push schema to development DB

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.
- `pnpm --filter @workspace/api-spec run codegen` — regenerate clients

### `lib/api-zod` / `lib/api-client-react`

Generated Zod schemas and React Query hooks from OpenAPI spec.
