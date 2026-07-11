# Homepage Spec

Replace the placeholder `src/app/page.tsx` ("hello" + two buttons) with the real marketing homepage, converting the static prototype at `prototypes/homepage/` (`index.html`, `styles.css`, `script.js`) into the actual Next.js app using the project's real stack.

**Reference:** `prototypes/homepage/` — content, copy, layout, and animation behavior should match it closely. `context/features/homepage-mockup-spec.md` documents the original design brief if more context on intent is needed.

---

## Goals

- Rebuild every section of the mockup as real React components under `src/app/` (or a new `src/components/homepage/` folder), not a copy-pasted HTML string.
- Use Tailwind CSS v4 + shadcn/ui, matching the conventions in `context/coding-standards.md` — no hand-rolled CSS file like `prototypes/homepage/styles.css`.
- Split into server and client components correctly (see below) — client components only where interactivity/animation actually requires it.
- All buttons and links route to real destinations, not `#` placeholders.
- Preserve the existing logged-in-aware behavior currently in `src/app/page.tsx` (session check → different CTAs).

---

## Sections to Build

1. **Navbar** — logo, Features/Pricing anchor links, Sign In / Get Started buttons, mobile hamburger menu, opacity-on-scroll effect.
2. **Hero** — headline with gradient text, subheadline, two CTA buttons, and the chaos→order visual (animated chaos box, arrow, mini dashboard preview).
3. **Features** — 6-card grid (editor, collections, tags, AI semantic search, AI summary, AI chatbot — the AI ones marked with a "Pro" badge).
4. **AI Section** — two columns: Pro badge + checklist copy on the left, code-editor mockup with an "AI Summary" panel demo on the right.
5. **Pricing** — Free vs Pro cards, monthly/yearly billing toggle, Pro's "Limited Time: Pro is FREE" promo styling.
6. **CTA band** — "Ready to organize your notes?" with a single button.
7. **Footer** — logo, link columns, dynamic copyright year.

---

## Component Breakdown (Server vs Client)

Default everything to a **server component**. Only mark a component `"use client"` when it needs interactivity, browser APIs, or hooks:

| Component | Type | Why |
|---|---|---|
| `page.tsx` (assembles all sections) | Server | No interactivity itself, checks session server-side |
| `HomeNavbar` | Client | Scroll listener for opacity change, mobile menu toggle state |
| `HomeHero` | Server | Static text/markup; wraps the chaos visual |
| `ChaosOrderVisual` / `ChaosBox` | Client | `requestAnimationFrame` drift/bounce/repel animation, mouse tracking |
| `HomeFeatures` | Server | Static cards, no interactivity |
| `HomeAiSection` | Server | Static copy + code mockup (Copy/Insert buttons in the demo are non-functional decoration, matching the mockup — style as disabled/inert buttons, not wired up) |
| `HomePricing` | Client | Monthly/yearly toggle is local state |
| `HomeCta` | Server | Static |
| `HomeFooter` | Server | `new Date().getFullYear()` works fine server-side, no client needed |
| `ScrollReveal` (wrapper) | Client | `IntersectionObserver`-based fade-in, wraps sections that need the reveal effect |

Keep server components as the default per `context/coding-standards.md` — only the 3-4 components above with genuine interactivity/browser APIs need `"use client"`.

---

## Routing / Links (must be real, not `#`)

- Logo / "Smark" → `/` (or scroll to top on the homepage itself)
- **Sign In** → `/login`
- **Get Started** (navbar, hero, pricing Free card, CTA band) → `/register`
- **Claim Free Pro Access** (pricing Pro card) → `/register`
- **Features** / **Pricing** nav links → in-page anchor scroll (`#features`, `#pricing`) — fine to keep as real anchors since these sections live on the same page
- If the user has an active session (mirror the existing `getServerSession(authOptions)` check in current `page.tsx`): navbar and hero/CTA buttons should point to `/dashboard` ("Go to Dashboard") instead of Sign In/Get Started
- Footer **Changelog / About / Blog / Contact / Privacy / Terms** — no real pages exist yet; either omit these links or leave them visibly disabled (e.g. `aria-disabled`, no `href`) rather than linking to `#`. Do not invent placeholder routes.

---

## Styling

- Use the app's existing theme tokens (`--color-primary`, `--background`, `--foreground`, `--muted`, etc. from `src/app/globals.css`) instead of the prototype's own hardcoded hex values — the mockup's palette was already copied from these tokens, so this should mostly be a 1:1 swap.
- Use shadcn `Button` (`variant="default"`/`"outline"`/`"ghost"`, `size="sm"`/`"lg"`) for all CTA/nav buttons instead of the mockup's custom `.btn` classes.
- Use shadcn `Card` for feature cards and pricing cards where it fits without fighting the design.
- Use shadcn `Switch` (or existing pattern in the codebase, if any) for the pricing billing toggle instead of the mockup's custom `.switch` markup.
- Keep the "Pro" badges — use shadcn `Badge`.
- Preserve responsive behavior described in the mockup spec: chaos/arrow/dashboard stack vertically on mobile with the arrow rotated 90°, grids collapse to single column.

---

## Code Quality (DRY)

- Feature cards, pricing card list items, and footer link columns should each be driven by a small local data array + `.map()`, not 6/5/3 copy-pasted JSX blocks.
- Reuse a single `ScrollReveal` wrapper component for the fade-in-on-scroll effect instead of repeating `IntersectionObserver` logic per section.
- Reuse existing shadcn primitives and `cn()` (`src/lib/utils.ts`) instead of introducing new one-off style utilities.
- No copy-pasted CSS from `prototypes/homepage/styles.css` — re-derive layout with Tailwind utility classes.

---

## Out of Scope

- No changes to `/login`, `/register`, or any dashboard routes.
- The AI Summary demo panel in the AI Section is decorative only (matches the mockup) — do not wire it to the real `POST /api/dashboard/note/[id]/summary` endpoint.
- No new footer pages (About/Blog/Contact/Changelog/Privacy/Terms) — just don't link to `#`.
- No changes to `prototypes/homepage/` itself; it remains as a reference/history artifact.
