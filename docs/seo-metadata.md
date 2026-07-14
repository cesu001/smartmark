# SEO Metadata

Research notes on SEO/metadata for **Smark** (Next.js App Router). This is documentation only — no source was changed. It maps which routes need metadata, what each should contain, and how that metadata drives SEO.

> Verified against the Next.js Metadata API docs (Context7, `/vercel/next.js`) on 2026-07-14.

---

## 1. How metadata affects SEO

Metadata is the machine-readable summary of a page. Search engines and social platforms read it directly; users see the results in SERPs and shared links.

| Metadata | Where it shows | SEO effect |
| :-- | :-- | :-- |
| `<title>` | SERP blue link, browser tab | **Strongest on-page ranking signal.** Should be unique per page, ~50–60 chars, keyword-led. |
| `description` | SERP snippet under the title | Not a direct ranking factor, but drives **click-through rate** (which indirectly influences ranking). ~150–160 chars. |
| Canonical (`alternates.canonical`) | — (invisible) | Tells Google the **preferred URL** for duplicate/paramaterized pages, consolidating link equity and preventing duplicate-content dilution. |
| `robots` (index/follow) | — | Controls whether a page is **allowed into the index** at all. Private/app pages should be `noindex`. |
| Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) | Facebook / LinkedIn / Slack / Discord link previews | No direct ranking effect, but a rich preview drives **shares and referral traffic**. Missing `og:image` = bare, low-CTR link cards. |
| Twitter Card (`twitter:card`, etc.) | X/Twitter link previews | Same as OG, for X. `summary_large_image` gives a full-width preview. |
| `metadataBase` | — | Base URL that turns **relative** OG/canonical paths into absolute URLs. Without it, social/canonical URLs don't resolve and OG images silently break. |
| `sitemap.xml` | — | Helps crawlers **discover** all public URLs and their freshness (`lastModified`). |
| `robots.txt` | — | Tells crawlers what to crawl and **points to the sitemap**. |
| Favicon / app icon | Browser tab, SERP favicon | Branding + trust signal in mobile SERPs. |
| `lang` attribute | — | Signals page language for correct indexing / hreflang. |

Key idea for this app: **the marketing surface (homepage + auth) is what should rank; the entire authenticated dashboard should be deliberately kept OUT of the index.**

---

## 2. Current state (as built)

| Item | Status | File |
| :-- | :-- | :-- |
| Root `title` / `description` | ✅ Present (`"Smark"` / generic) | `src/app/layout.tsx` |
| Dashboard page metadata | ✅ Present (`title: "Dashboard"`) | `src/app/dashboard/page.tsx` |
| App icon / favicon | ✅ Generated "S" mark | `src/app/icon.tsx` |
| `<html lang>` | ✅ `lang="en"` | `src/app/layout.tsx` |
| `metadataBase` | ❌ Missing | — |
| Title template (`title.template`) | ❌ Missing | — |
| Open Graph tags | ❌ Missing everywhere | — |
| Twitter Card tags | ❌ Missing everywhere | — |
| Canonical URLs | ❌ Missing | — |
| `robots` directives | ❌ Missing (dashboard is indexable!) | — |
| `robots.txt` | ❌ Missing | — |
| `sitemap.xml` | ❌ Missing | — |
| Auth pages metadata | ❌ None have their own metadata | `src/app/(auth)/*` |

**Notable gaps / risks:**

1. **The dashboard has no `noindex`.** Every `/dashboard/*` route inherits the root title and is technically crawlable. These are private, auth-gated, per-user pages — they should never be indexed. (Auth middleware redirects unauthenticated users, so Google mostly sees the login redirect, but an explicit `robots: noindex` is the correct guarantee.)
2. **No `metadataBase`.** The env var `NEXT_PUBLIC_APP_URL` already exists (`.env.example`, currently `http://localhost:3000`, production `https://smark.tw`) — it just isn't wired into metadata. Any future OG image or canonical will be broken until this is set.
3. **No Open Graph / Twitter tags.** Sharing `smark.tw` in Slack/X/LinkedIn produces a bare link with no image, title, or description card.
4. **Root description is generic** and not repeated as an OG description.
5. **No sitemap or robots.txt**, so crawlers have no discovery hints and no signal about which paths to avoid.

---

## 3. Route inventory — what needs metadata

Routes fall into two SEO buckets: **public (index & optimize)** and **private (noindex)**.

### 3a. Public routes — SHOULD be indexed & fully optimized

| Route | File | Purpose | Metadata priority |
| :-- | :-- | :-- | :-- |
| `/` | `src/app/page.tsx` | Marketing homepage (hero, features, pricing) | **Highest** — full title, description, OG, Twitter, canonical |
| `/login` | `src/app/(auth)/login/page.tsx` | Login | Title + description; canonical |
| `/register` | `src/app/(auth)/register/page.tsx` | Sign up | Title + description; canonical (conversion page) |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | Request reset | Title + description |
| `/reset-password` | `src/app/(auth)/reset-password/page.tsx` | Set new password (token link) | Title + description + **`robots: noindex`** (token URLs must not be indexed) |

> The `@authModal/(.)*` intercepting routes are modal overlays of the same auth pages — they share the underlying route's metadata and need nothing separate.

### 3b. Private routes — SHOULD be `noindex, nofollow`

All of these are behind auth and per-user. They need a **useful browser-tab title** (good UX) but must be excluded from search indexes.

| Route | File |
| :-- | :-- |
| `/dashboard` | `src/app/dashboard/page.tsx` |
| `/dashboard/allnotes` | `src/app/dashboard/allnotes/page.tsx` |
| `/dashboard/favorites` | `src/app/dashboard/favorites/page.tsx` |
| `/dashboard/pinned` | `src/app/dashboard/pinned/page.tsx` |
| `/dashboard/profile` | `src/app/dashboard/profile/page.tsx` |
| `/dashboard/workbench` | `src/app/dashboard/workbench/page.tsx` |
| `/dashboard/collection/[id]` | `src/app/dashboard/collection/[id]/page.tsx` |
| `/dashboard/tag/[id]` | `src/app/dashboard/tag/[id]/page.tsx` |

Best handled once at the **`src/app/dashboard/layout.tsx`** level with `robots: { index: false, follow: false }` and a title template (e.g. `%s · Smark`), so every child inherits noindex without repeating it.

### 3c. API routes — no metadata

`src/app/api/**` are JSON handlers; metadata does not apply.

---

## 4. What each metadata object should contain

### 4a. Root layout — shared defaults (`src/app/layout.tsx`)

Set the foundation that every page inherits and extends:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://smark.tw"
  ),
  title: {
    default: "Smark — AI-powered Markdown notes & knowledge base",
    template: "%s · Smark", // child `title: "Login"` → "Login · Smark"
  },
  description:
    "Smark is an AI-powered Markdown note app with semantic search, an AI chatbot, and AI summaries — find your notes by meaning, not just keywords.",
  applicationName: "Smark",
  openGraph: {
    type: "website",
    siteName: "Smark",
    title: "Smark — AI-powered Markdown notes & knowledge base",
    description:
      "Capture Markdown notes and retrieve them by meaning with AI semantic search and chat.",
    url: "/",
    images: ["/og.png"], // 1200×630; add to /public (or an opengraph-image file)
  },
  twitter: {
    card: "summary_large_image",
    title: "Smark — AI-powered Markdown notes & knowledge base",
    description:
      "AI-powered Markdown notes with semantic search and an AI chatbot.",
    images: ["/og.png"],
  },
};
```

- **`metadataBase`** is the single most impactful missing piece — it makes every relative OG/canonical URL resolve. Wire it to the existing `NEXT_PUBLIC_APP_URL`.
- **`title.template`** means child pages only supply the short part (`title: "Dashboard"` → `Dashboard · Smark`).

### 4b. Homepage (`src/app/page.tsx`)

The homepage currently has **no** metadata export (it just renders components). It's the top ranking target, so it should export its own richer metadata and a canonical:

```tsx
export const metadata: Metadata = {
  title: { absolute: "Smark — AI Markdown Notes & Knowledge Base" },
  description: "…keyword-rich, benefit-led, ~155 chars…",
  alternates: { canonical: "/" },
};
```

Recommended focus keywords (from `context/project-overview.md`): *AI notes, Markdown notes, semantic search, knowledge base, note-taking, embeddings*.

### 4c. Auth pages (`src/app/(auth)/*`)

Each should export a minimal metadata object; the root template supplies the ` · Smark` suffix:

| Page | title | description | robots |
| :-- | :-- | :-- | :-- |
| Login | `Log In` | "Log in to your Smark account…" | index |
| Register | `Sign Up` | "Create a free Smark account and start taking AI-powered notes." | index |
| Forgot password | `Reset Password` | "Request a password reset link for your Smark account." | index |
| Reset password | `Reset Password` | "Set a new password for your Smark account." | **`noindex`** |

> Since auth pages are Server Components that only `redirect()` when a session exists, a static `export const metadata` works. Reset-password should be `robots: { index: false }` because its URLs carry one-time tokens.

### 4d. Dashboard layout (`src/app/dashboard/layout.tsx`)

Add once, inherited by all dashboard children:

```tsx
export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Smark" },
  robots: { index: false, follow: false },
};
```

Dynamic pages (`collection/[id]`, `tag/[id]`) can optionally add a `generateMetadata` to set a per-entity tab title (e.g. the collection name) — purely for UX, still noindex via inheritance:

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;
  const collection = await getCollection(id); // ownership-checked helper
  return { title: collection?.name ?? "Collection" };
}
```

### 4e. `robots.txt` — `src/app/robots.ts`

Allow the marketing/auth surface, disallow the app and API, point at the sitemap:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://smark.tw";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/reset-password"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

### 4f. `sitemap.xml` — `src/app/sitemap.ts`

List only public, indexable URLs:

```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://smark.tw";
  return ["", "/login", "/register", "/forgot-password"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));
}
```

### 4g. Open Graph image

Two options:
- **Static:** drop a 1200×630 `public/og.png` and reference it (as above).
- **Generated:** add `src/app/opengraph-image.tsx` using `next/og` `ImageResponse` — the same technique already used in `src/app/icon.tsx`, so no new dependency. Next.js auto-wires an `opengraph-image` file into the route's OG tags.

---

## 5. JSON-LD / Structured Data (schema.org)

JSON-LD is a **separate mechanism** from the `<meta>` / Open Graph tags above. Those tags describe the page; JSON-LD describes the **entities** on it (your organization, the app, its pricing) in a graph search engines can parse into **rich results** — sitelinks search box, org logo/knowledge panel, and price/offer cards. It is **not** part of Next.js's `Metadata` object; per the Next.js docs it's rendered as a native `<script type="application/ld+json">` tag inside the page/layout Server Component.

> **Why not `next/script`?** JSON-LD is structured data, not executable JS. Next.js explicitly recommends a plain `<script>` tag; `next/script` is for loading/executing JavaScript and is the wrong tool here.

### 5a. Where it applies

Only **public** pages benefit — primarily the **homepage** (`src/app/page.tsx`). The dashboard is `noindex`, so structured data there has no value. Recommended types for Smark:

| schema.org type | Page | What it earns |
| :-- | :-- | :-- |
| `Organization` | Homepage | Brand entity: name, logo, URL — feeds the knowledge panel / SERP logo. |
| `WebSite` + `SearchAction` | Homepage | Eligible for the **sitelinks search box** in Google. |
| `SoftwareApplication` (or `Product` + `Offer`) | Homepage | Maps to the **Free/Pro pricing** already on the page — eligible for price/offer rich results. |

### 5b. Recommended homepage JSON-LD

The homepage is already a Server Component (`src/app/page.tsx`), so the object can be built inline and injected directly. A single graph combining all three entities:

```tsx
export default async function Home() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://smark.tw";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "Smark",
        url: base,
        logo: `${base}/og.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "Smark",
        publisher: { "@id": `${base}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${base}/dashboard?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Smark",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        description:
          "AI-powered Markdown note app with semantic search and an AI chatbot.",
        offers: [
          {
            "@type": "Offer",
            name: "Free",
            price: "0",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            name: "Pro",
            price: "5",
            priceCurrency: "USD",
          },
        ],
      },
    ],
  };

  return (
    <div id="top">
      <script
        type="application/ld+json"
        // .replace(/</g, "\\u003c") is the Next.js-recommended XSS guard
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* …existing homepage sections… */}
    </div>
  );
}
```

### 5c. Notes & caveats

- **XSS escaping is required.** Always `JSON.stringify(...).replace(/</g, "<")` — this is the exact guard the Next.js docs prescribe, since the object may contain user-influenced or free-text strings.
- **Pricing must stay truthful.** The `Offer` prices ($0 / $5) must match what the pricing UI actually shows, or Google can flag mismatched structured data. Note the homepage currently advertises **"Pro is FREE (limited time)"** with the $5/$50 struck through — if that promo is live, either omit the paid `Offer` or reflect the promotional price, otherwise the markup contradicts the visible page.
- **`SearchAction`** points at an on-site search entry point; the `target` above is illustrative — only include it if you want the sitelinks search box, and point it at a real query-able URL.
- **Validate** the final markup with Google's [Rich Results Test](https://search.google.com/test/rich-results) and the [Schema Markup Validator](https://validator.schema.org/) before relying on it.
- Keep it to the **homepage** for now. Adding `Product`/`Offer` on a dynamic dashboard page would be wasted effort (noindex).

---

## 6. Priority checklist (highest impact first)

1. **Add `metadataBase`** to the root layout (wire to `NEXT_PUBLIC_APP_URL`). Unlocks every other absolute-URL feature. *(one line)*
2. **Add `robots: { index: false }` to `dashboard/layout.tsx`.** Keeps private per-user pages out of the index. *(correctness/privacy)*
3. **Add a `title.template`** in the root so child pages get consistent `X · Smark` titles.
4. **Give the homepage a real metadata export** (title, description, canonical) — it's the primary ranking target and currently has none.
5. **Add Open Graph + Twitter tags + an OG image** (static `public/og.png` or generated `opengraph-image.tsx`) for rich link previews.
6. **Add `robots.ts` and `sitemap.ts`** for crawl discovery + exclusion.
7. **Add per-page metadata to the 4 auth pages**, with `noindex` on reset-password.

Items 1–4 are small, high-leverage edits. 5–7 add the discovery/social layer.

---

## 7. Notes & assumptions

- Production domain is `smark.tw` (from `context/current-feature.md` history and `.env`); `NEXT_PUBLIC_APP_URL` is the source of truth and should back `metadataBase`, `robots.ts`, and `sitemap.ts`.
- App copy is English on-screen (`lang="en"` is correct) even though internal docs are Traditional Chinese. If a zh-TW UI is ever added, revisit `lang` + hreflang `alternates.languages`.
- The intercepting `@authModal` routes need no separate metadata (they overlay existing routes).
- All code blocks above are **illustrative targets**, not applied changes — this file is documentation only.
