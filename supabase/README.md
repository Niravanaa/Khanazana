# Supabase Setup

This folder holds Supabase migration SQL files used by the project.

## Sprint 1 migration

- File: `migrations/20260427_sprint1_recipes.sql`
- Adds:
  - `public.recipes` table
  - RLS policies scoped to authenticated user ownership
  - `recipe-images` storage bucket + policies

## Apply migration

Use Supabase SQL editor (or CLI if configured) to apply files in `migrations/`.

## Auth setup

In Supabase dashboard:

- Enable Google provider in Authentication > Providers.
- Set redirect URL to `<APP_URL>/auth/callback` (for local: `http://localhost:3000/auth/callback`).

Planned in upcoming sprint tasks:

- Add migration SQL files for meal plans and shopping lists.
