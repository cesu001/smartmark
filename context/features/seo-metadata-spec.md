# SEO Metadata

## Overview

Add SEO metadata across the app so the public marketing/auth surface ranks and shows rich link previews, while the entire authenticated dashboard is kept out of search indexes. Full research and target code in `docs/seo-metadata.md`.

Production domain is `smark.tw`; `NEXT_PUBLIC_APP_URL` is the source of truth for all base URLs.

## Requirements

### 1. Root layout — `src/app/layout.tsx`

- Add `metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://smark.tw")`.
- Convert `title` to `{ default, template }` with template `"%s · Smark"`.
- Set a real default description (semantic search, AI chatbot, AI summaries — **no auto-tagging/auto-organize, that feature does not exist**).
- Add `openGraph` (type `website`, siteName, title, description, url `/`, image) and `twitter` (`summary_large_image`, title, description, image) defaults.

### 2. Homepage — `src/app/page.tsx`

- Add a `metadata` export: absolute title, keyword-rich ~155-char description, `alternates.canonical: "/"`.
- Add homepage **JSON-LD** via a native `<script type="application/ld+json">` (NOT `next/script`), with the `.replace(/</g, "<")` XSS guard. Single `@graph` with `Organization`, `WebSite` + `SearchAction`, and `SoftwareApplication` + `Offer`.
- **Pricing in JSON-LD must match the visible pricing UI.** The homepage shows "Pro is FREE (limited time)" with $5/$50 struck through — reflect the promo (or omit the paid Offer), do not hardcode a contradicting $5.

### 3. Dashboard layout — `src/app/dashboard/layout.tsx`

- Add `metadata` with `robots: { index: false, follow: false }` and `title: { default: "Dashboard", template: "%s · Smark" }`.
- This makes every `/dashboard/*` page noindex via inheritance. Keep the existing `title: "Dashboard"` on `dashboard/page.tsx` (or remove now-redundant one — either is fine).
- Optional: `generateMetadata` on `collection/[id]` and `tag/[id]` for a per-entity tab title (uses an ownership-checked helper). UX only, still noindex.

### 4. Auth pages — `src/app/(auth)/*`

Add a static `metadata` export to each:

| Page | title | robots |
| :-- | :-- | :-- |
| login | `Log In` | index |
| register | `Sign Up` | index |
| forgot-password | `Reset Password` | index |
| reset-password | `Reset Password` | **`noindex`** (token URLs) |

### 5. `robots.txt` — new `src/app/robots.ts`

- `allow: "/"`, `disallow: ["/dashboard/", "/api/", "/reset-password"]`, `sitemap: ${base}/sitemap.xml`.

### 6. `sitemap.xml` — new `src/app/sitemap.ts`

- Public URLs only: `/`, `/login`, `/register`, `/forgot-password`. Homepage priority 1, rest 0.5.

### 7. Open Graph image

- Add an OG image referenced by root `openGraph`/`twitter`. Either a static `public/og.png` (1200×630) or a generated `src/app/opengraph-image.tsx` using `next/og` `ImageResponse` (same technique as existing `src/app/icon.tsx`, no new dependency). Generated is preferred to stay consistent with the existing icon approach.

## Out of scope

- Dashboard/API structured data (noindex — no value).
- hreflang / multi-language (app is English-only on-screen; `lang="en"` stays).
- `@authModal/(.)*` intercepting routes (inherit their base route's metadata).

## Verification

- `npm run build` passes; `npm run lint` clean on changed files.
- View source / DevTools on `/` and `/login`: title template applied, OG/Twitter tags present with absolute URLs, canonical present.
- View source on a `/dashboard` page: `robots` = `noindex`.
- Fetch `/robots.txt` and `/sitemap.xml`: correct allow/disallow + public URLs.
- Validate homepage JSON-LD with Google Rich Results Test / schema.org validator.
- Confirm OG preview renders (e.g. paste URL in Slack or use a card debugger).

## Notes

- Documentation reference: `docs/seo-metadata.md` (§4 has target code for every item, §5 JSON-LD, §6 priority order).
- Priority order if split across commits: metadataBase → dashboard noindex → title template → homepage metadata → OG/Twitter+image → robots/sitemap → auth pages → JSON-LD.
