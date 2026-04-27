# Current Feature

## Status

<!-- Not Started|In Progress|Completed -->

Not Started

## Goals

## References

## Notes

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-17** — Initial Next.js project setup. Scaffolded with Create Next App, moved files to `src/` directory structure, added `CLAUDE.md` and context documentation files.
- **2026-03-17** — Added mock data (`src/lib/mock-data.ts`) and dashboard types (`src/types/dashboard.ts`).
- **2026-03-18** — Completed Dashboard UI Phase 1. Created `/dashboard` route with dark mode global styles, top bar (search + Import + New Note buttons), and sidebar/main placeholders.
- **2026-03-18** — Completed Dashboard UI Phase 2. Implemented collapsible sidebar with Notes, Collections, Tags sections (each collapsible), user avatar + settings button at bottom, drawer icon to open/close, mobile full-screen drawer (collapsed by default), and static header with logo + sidebar toggle.
- **2026-03-20** — Completed Dashboard UI Phase 3. Implemented main content area with 4 stats cards (Total Notes, Collections, Favorite Notes, Favorite Collections), Pinned Notes section, Recent Collections section (up to 5), and Recent Notes section (up to 10). Created StatsCard, NoteCard, and CollectionCard components. All data sourced from mock data.
- **2026-03-25** — Set up Prisma 7 with Neon PostgreSQL (serverless). Installed and configured Prisma 7, connected to Neon via `DATABASE_URL`, created full schema including NextAuth models (Account, Session, VerificationToken) and app models (User, Note, Collection, Tag, NoteTag), enabled `pgvector` extension for AI embeddings, and created initial migration.
- **2026-03-25** — Implemented `prisma/seed.ts`. Created idempotent seed script using `upsert` that populates the DB with a demo user (`demo@smartmark.io`), 5 collections, 8 tags, and 8 notes with full tag relationships. Installed `bcryptjs` and `@types/bcryptjs`. Configured seed command in `prisma.config.ts` (`migrations.seed`). Verified seed runs successfully via `npx prisma db seed`.
- **2026-03-25** — Renamed original `scripts/test-db.ts` to `test-db-connection.ts`. Created `scripts/test-db-seedFetch.ts` to fetch and display all seed data (user, collections, tags, notes with relationships). Added `test:db` and `test:seed` scripts to `package.json`. Verified all seed data is correct via `npm run test:seed`.
- **2026-03-25** — Replaced mock collections data with real DB data on the dashboard. Created `src/lib/db/collections.ts` with `getRecentCollections` and `getCollectionStats` functions. Collections and Favorite Collections stat cards now use live DB counts. Recent Collections section fetches from Neon via Prisma (demo user). `CollectionCard` updated to accept a `borderColor` prop derived from the most-used content type across each collection's note tags (frontend → blue, backend → green, testing → orange). Notes sections remain on mock data for now.
- **2026-03-30** — Replaced mock notes data with real DB data on the dashboard. Created `src/lib/db/notes.ts` with `getNoteStats`, `getRecentNotes`, and `getPinnedNotes` functions. Created `src/lib/db/tags.ts` with `getAllTags` function. Total Notes and Favorite Notes stat cards now use live DB counts. Pinned Notes and Recent Notes sections fetch from Neon via Prisma (demo user). Removed all remaining mock data usage from `dashboard/page.tsx`.
- **2026-04-23** — Added shadcn/ui component library setup with sidebar, avatar, collapsible, dropdown-menu, input, separator, sheet, skeleton, and tooltip components. Installed `next-themes` and wired `ThemeProvider` into root layout with system default and class-based dark mode. Added `AppNavbar`, `AppSidebar`, and `ModeToggle` components. Fixed light mode text color so `--color-text-primary` resolves to `#1a1a1a` in light mode and remains `#e8e8e8` in dark mode via `html:not(.dark)` override.
- **2026-04-27** — Rebuilt `/dashboard1` with shadcn/ui components and live DB data. Replaced placeholder page with responsive grid dashboard (recent notes, pinned notes, stats, collections, tags). Extracted focused server components: `AppNoteCard`, `AppColCard`, `AppStatList`, `AppRecentNotes`, `AppPinnedNotes`, `AppRecentCollections`, `AppFavCollections`. Added `getRecentCollection` and `getFavCollection` DB helpers in `src/lib/db/collections.ts`. Added `src/components/ui/card.tsx` shadcn card component.
