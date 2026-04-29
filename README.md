![](https://i.imgur.com/Ya8aS22.png)

<div align="center">
<img src="https://i.imgur.com/t5dwnPj.png"/>
<p>A recipe manager that lets you store, organize recipes, plan weekly meals, and generate shopping lists — built with Next.js, Supabase, and Prisma.
</p>
</div>

<div align="center">

[![Contributors](https://img.shields.io/github/contributors/Niravanaa/Khanazana?style=flat-square)](https://github.com/Niravanaa/Khanazana/graphs/contributors)
[![CI](https://github.com/Niravanaa/Khanazana/actions/workflows/ci.yml/badge.svg)](https://github.com/Niravanaa/Khanazana/actions/workflows/ci.yml)
[![Forks](https://img.shields.io/github/forks/Niravanaa/Khanazana?style=flat-square)](https://github.com/Niravanaa/Khanazana/network/members)
[![Stars](https://img.shields.io/github/stars/Niravanaa/Khanazana?style=flat-square)](https://github.com/Niravanaa/Khanazana/stargazers)
[![Open Issues](https://img.shields.io/github/issues/Niravanaa/Khanazana?style=flat-square)](https://github.com/Niravanaa/Khanazana/issues)
[![License](https://img.shields.io/github/license/Niravanaa/Khanazana?style=flat-square)](./LICENSE)
[![codecov](https://codecov.io/gh/Niravanaa/Khanazana/branch/main/graph/badge.svg)](https://codecov.io/gh/Niravanaa/Khanazana)

</div>

## Features

- **Auth** — Google OAuth and email/password sign-in via Supabase Auth
- **Recipe management** — Create, view, edit, and delete recipes with title, description, ingredients, tags, and cook time
- **Image upload** — Attach photos to recipes, stored in Supabase Storage
- **Meal planning** — Plan weekly meals by assigning recipes to specific days and meal slots
- **Shopping list** — Auto-generate organized shopping lists from meal plans with export capability
- **Monorepo** — `pnpm` workspaces with `apps/frontend` (Next.js) and `packages/shared`
- **Quality gates** — Husky pre-commit hooks, lint-staged, branch/commit message validation, and GitHub Actions CI (lint, type-check, tests, coverage upload)
- **Test coverage** — Vitest unit tests with ≥ 70% coverage enforced on every PR, uploaded to codecov

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local Supabase)
- [Supabase CLI](https://github.com/supabase/cli/releases) (`~/.supabase/supabase.exe` on Windows)

### 1. Clone and install

```bash
git clone https://github.com/Niravanaa/Khanazana.git
cd Khanazana/Khanazana
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Start local Supabase (Docker must be running):

```bash
~/.supabase/supabase.exe start
```

This prints the local URLs and keys — copy them into `.env`:

| Variable                        | Description                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Local API URL (e.g. `http://localhost:54331`)                                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local anon key                                                                              |
| `NEXT_PUBLIC_APP_URL`           | Frontend URL (default `http://localhost:3000`)                                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (for admin ops / seed)                                                     |
| `DATABASE_URL`                  | Postgres connection string (e.g. `postgresql://postgres:postgres@localhost:54332/postgres`) |

### 3. Push the schema and seed test data

```bash
pnpm db:push   # applies Prisma schema to local DB
pnpm db:seed   # creates a test user + 5 sample recipes
```

Test credentials: `test@khanazana.dev` / `password123`

### 4. Run

```bash
pnpm dev       # starts Next.js at http://localhost:3000
```

### Useful scripts

| Command            | Description               |
| ------------------ | ------------------------- |
| `pnpm dev`         | Start dev server          |
| `pnpm build`       | Production build          |
| `pnpm verify`      | Lint + type-check + tests |
| `pnpm test`        | Run Vitest with coverage  |
| `pnpm db:push`     | Sync Prisma schema to DB  |
| `pnpm db:seed`     | Seed test data            |
| `pnpm db:generate` | Regenerate Prisma client  |
