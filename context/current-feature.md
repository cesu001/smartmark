# Current Feature

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

- Build login and register UI with email/password and GitHub OAuth
- Wire up NextAuth v5 credentials + GitHub provider
- Protect dashboard routes via middleware

## References

## Notes

- Login is available as both a full page (`/login`) and an intercepting route modal (`@authModal/(.)login`) for seamless UX from the home page
- `LoginForm` handles credentials sign-in via NextAuth `signIn("credentials")` with redirect to `/dashboard` on success
- Dashboard data is fetched by `userId` from session (no more email-based DB lookup)

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
- **2026-05-01** — Scaffolded auth UI on `feature/auth` branch. Added `react-hook-form`, `@hookform/resolvers`, `zod`, `react-icons`, and `next-auth` packages. Created `LoginForm` component (`src/components/auth/LoginForm.tsx`) with email + password fields, zod validation, and react-hook-form. Created full-page login route (`src/app/(auth)/login/page.tsx`) with GitHub OAuth button and email/password form. Created intercepting route modal (`src/app/@authModal/(.)login/page.tsx`) so navigating to `/login` from the home page opens a Dialog overlay instead. Added `@authModal` parallel route slot to root layout. Added shadcn `dialog.tsx`, `field.tsx`, and `label.tsx` UI components. NextAuth `signIn` wiring pending.
- **2026-05-16** — Wired up NextAuth credentials sign-in. Extracted `authOptions` to `src/lib/auth.ts` and added JWT/session callbacks to inject `user.id` into the session. Extended NextAuth types via `src/types/next-auth.d.ts`. Created `src/lib/auth-utils.ts` with `requireUser()` and `requireUserId()` helpers. Refactored `dashboard/page.tsx` to use `requireUserId()` instead of email-based DB lookup. Extracted `SocialSignIn` client component; made login page a proper server component. Middleware updated to redirect authenticated users away from `/login` and unauthenticated users away from `/dashboard`.
