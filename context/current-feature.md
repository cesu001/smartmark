# Current Feature

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

Set up Prisma 7 with Neon PostgreSQL (serverless) as the database for SmartMark.

- Install and configure Prisma 7
- Connect to Neon PostgreSQL via `DATABASE_URL`
- Create full schema based on `context/project-overview.md` — including NextAuth models (Account, Session, VerificationToken) and all app models (User, Note, Collection, Tag, NoteTag)
- Enable `pgvector` extension for AI embeddings
- Add appropriate indexes and ensure cascade deletes are in place
- Create initial migration with `prisma migrate dev` (never push directly)
- Verify migration runs cleanly and Prisma Client generates without errors

## References

- `context/features/database-spec.md`
- `context/project-overview.md`
- `context/coding-standards.md`

## Notes

- Use Neon PostgreSQL serverless — `DATABASE_URL` points to the **development** branch
- Always use `prisma migrate dev` for schema changes, never `db push`
- Prisma 7 has breaking changes — read the upgrade guide before implementing

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-17** — Initial Next.js project setup. Scaffolded with Create Next App, moved files to `src/` directory structure, added `CLAUDE.md` and context documentation files.
- **2026-03-17** — Added mock data (`src/lib/mock-data.ts`) and dashboard types (`src/types/dashboard.ts`).
- **2026-03-18** — Completed Dashboard UI Phase 1. Created `/dashboard` route with dark mode global styles, top bar (search + Import + New Note buttons), and sidebar/main placeholders.
- **2026-03-18** — Completed Dashboard UI Phase 2. Implemented collapsible sidebar with Notes, Collections, Tags sections (each collapsible), user avatar + settings button at bottom, drawer icon to open/close, mobile full-screen drawer (collapsed by default), and static header with logo + sidebar toggle.
- **2026-03-20** — Completed Dashboard UI Phase 3. Implemented main content area with 4 stats cards (Total Notes, Collections, Favorite Notes, Favorite Collections), Pinned Notes section, Recent Collections section (up to 5), and Recent Notes section (up to 10). Created StatsCard, NoteCard, and CollectionCard components. All data sourced from mock data.
