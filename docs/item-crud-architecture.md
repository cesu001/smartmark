# Item CRUD Architecture

SmartMark uses **API routes** for all mutations (no Server Actions directory exists). Data fetching for server-rendered pages lives in `src/lib/db/`. Client components call API routes directly via `fetch`.

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── dashboard/
│   │       ├── note/
│   │       │   ├── route.ts          # POST (create note)
│   │       │   └── [id]/route.ts     # GET / PUT / DELETE (single note)
│   │       ├── collection/
│   │       │   ├── route.ts          # GET (list) / POST (create)
│   │       │   └── [id]/notes/route.ts  # GET (notes for sidebar hover)
│   │       └── tag/
│   │           ├── route.ts          # GET (list) / POST (create)
│   │           └── [id]/notes/route.ts  # GET (notes for sidebar hover)
│   └── dashboard/
│       ├── workbench/page.tsx        # Triggers POST /note (new note)
│       ├── allnotes/page.tsx         # Reads via lib/db
│       ├── pinned/page.tsx           # Reads via lib/db
│       ├── favorites/page.tsx        # Reads via lib/db
│       ├── collection/[id]/page.tsx  # Reads via lib/db
│       └── tag/[id]/page.tsx         # Reads via lib/db
├── lib/
│   └── db/
│       ├── notes.ts                  # Read-only query helpers
│       ├── collections.ts            # Read-only query helpers
│       └── tags.ts                   # Read-only query helpers
└── components/
    └── dashboard/
        ├── NoteDrawer.tsx            # PUT /note/[id] (auto-save)
        ├── AppNoteCard.tsx           # DELETE /note/[id]
        ├── SidebarAddCollection.tsx  # POST /collection
        └── SidebarAddTag.tsx         # POST /tag
```

---

## API Routes (Mutations + Reads for Client Components)

### Note — `/api/dashboard/note`

**POST** — create note  
Auth: `requireUserId()`  
Input (Zod): `{ title, collectionId?, tagIds?, content }`  
Prisma: `note.create()` with nested `tags.create` for each tagId  
Returns: `{ id }` (201)

**GET** `/api/dashboard/note/[id]` — fetch single note  
Prisma: `note.findFirst()` with ownership check + tag includes  
Returns: full note object with tags, timestamps, isFavorite, isPinned

**PUT** `/api/dashboard/note/[id]` — update note  
Input (Zod): same as POST schema  
Prisma:
1. `note.findFirst()` — ownership check
2. `collection.findFirst()` / `collection.create()` — auto-creates a `"Draft"` collection if no `collectionId` provided
3. `note.update()` — atomically replaces tags (`tags.deleteMany: {}` then `tags.create`)

Returns: `{ id, collectionId }`

**DELETE** `/api/dashboard/note/[id]`  
Prisma: `note.findUnique()` (ownership) → `note.delete()` (schema cascades `NoteTag` rows)  
Returns: 204

---

### Collection — `/api/dashboard/collection`

**GET** — list user collections (used by NoteDrawer to populate the collection dropdown)  
Prisma: `collection.findMany()` ordered by name  
Returns: `{ id, name }[]`

**POST** — create collection  
Input (Zod): `{ name }` (1–100 chars)  
Prisma: `collection.create()`  
Returns: `{ id, name }` (201)

**GET** `/api/dashboard/collection/[id]/notes` — list notes for sidebar hover menu  
Prisma: `collection.findFirst()` with ownership check, selects `notes { id, title }` ordered by `updatedAt` desc  
Returns: `{ id, title }[]`  
Used by: `SidebarHoverMenuItem` (fetches lazily on first hover, result cached in component ref)

No update or delete endpoints exist yet.

---

### Tag — `/api/dashboard/tag`

**GET** — list user tags (used by NoteDrawer to populate the tag multi-select)  
Prisma: `tag.findMany()` ordered by name  
Returns: `{ id, name }[]`

**POST** — create tag  
Input (Zod): `{ name }` (1–100 chars)  
Prisma: `tag.create()`  
Returns: `{ id, name }` (201)

**GET** `/api/dashboard/tag/[id]/notes` — list notes for sidebar hover menu  
Prisma: `tag.findFirst()` with ownership check, traverses `NoteTag` join (`notes { note { id, title } }`) ordered by `note.updatedAt` desc  
Returns: `{ id, title }[]`  
Used by: `SidebarHoverMenuItem` (fetches lazily on first hover, result cached in component ref)

No update or delete endpoints exist yet.

---

## Data Fetching — `src/lib/db/` (Server Components Only)

These are pure Prisma helper functions called directly from server components. They never mutate data.

### `src/lib/db/notes.ts`

| Function | Description |
|---|---|
| `getNoteStats(userId)` | Returns `{ total, favorites }` counts |
| `getAllNotes(userId)` | All notes ordered by `updatedAt` desc, with tags |
| `getRecentNotes(userId, limit)` | Most recently updated notes, with tags |
| `getFavoriteNotes(userId)` | Notes where `isFavorite = true`, with tags |
| `getPinnedNotes(userId, limit?)` | Notes where `isPinned = true`, with tags; `limit` optional |
| `getNoteById(noteId, userId)` | Single note by id + ownership, with tags |

All note queries share a `noteTagInclude` constant: `{ tags: { include: { tag: { select: { id, name } } } } }`.

### `src/lib/db/collections.ts`

| Function | Description |
|---|---|
| `getAllCollections(userId)` | Returns `{ id, name }[]` |
| `getCollectionStats(userId)` | Returns `{ total, favorites }` counts |
| `getRecentCollection(userId, limit?)` | Recent collections with `_count.notes` |
| `getFavCollection(userId, limit?)` | Collections where `isFavorite = true` |
| `getCollectionWithNotes(collectionId, userId)` | Collection + all notes + tags in one query, with ownership enforcement |

### `src/lib/db/tags.ts`

| Function | Description |
|---|---|
| `getAllTags(userId)` | All tags with `_count.notes` |
| `getFavoriteTags(userId)` | Tags where `isFavorite = true` with `_count.notes` |
| `getTagWithNotes(tagId, userId)` | Tag + all associated notes + tags, with ownership enforcement |

---

## Routing

### Note navigation
Notes open in the **workbench** — a multi-tab workspace at `/dashboard/workbench`.

- URL encodes open tabs via search params: `?open={noteId}&title={encodedTitle}&tabs={id_title,id_title,...}`
- `AppNoteCard` links to `/dashboard/workbench?open={noteId}&title={encodedTitle}`
- The workbench creates new notes on the `+` button click: POSTs to `/api/dashboard/note`, then pushes the new `noteId` into the URL

### Collection navigation
- Sidebar lists collections; each links to `/dashboard/collection/[id]`
- The collection page calls `getCollectionWithNotes(id, userId)` directly in the server component

### Tag navigation
- Sidebar lists tags with note counts; each links to `/dashboard/tag/[id]`
- The tag page calls `getTagWithNotes(id, userId)` directly in the server component

---

## Component Responsibilities

### `NoteDrawer` (`src/components/dashboard/NoteDrawer.tsx`)
Client component. The core editing surface.
- On mount: `GET /api/dashboard/note/[id]` to hydrate editor state
- On any change (title, content, collection, tags): debounced 1-second auto-save via `PUT /api/dashboard/note/[id]`
- Shows "Saving… / Saved" status indicator
- Fetches collections (`GET /api/dashboard/collection`) and tags (`GET /api/dashboard/tag`) for dropdowns
- After auto-save: re-fetches to sync `collectionId` if Draft was auto-assigned
- Props: `noteId`, `startInEditMode?`, `onEditModeChange?`

### `AppNoteCard` (`src/components/dashboard/AppNoteCard.tsx`)
Client component. Renders a note in grid/list views.
- Shows title, content preview, first 2 tags, updated date
- Triple-dot menu → Delete → `AlertDialog` confirmation → `DELETE /api/dashboard/note/[id]` → `router.refresh()`
- Title is a link to the workbench with encoded note identity

### `SidebarAddCollection` (`src/components/dashboard/SidebarAddCollection.tsx`)
Client component. Inline creation form in the sidebar Collections section.
- Plus icon toggles an inline `Input` + confirm/cancel buttons
- Submit: `POST /api/dashboard/collection` → `router.refresh()` + success toast
- Escape key cancels

### `SidebarAddTag` (`src/components/dashboard/SidebarAddTag.tsx`)
Client component. Mirrors `SidebarAddCollection` exactly for the Tags section.
- Submit: `POST /api/dashboard/tag` → `router.refresh()` + success toast

### `SidebarHoverMenuItem` (`src/components/dashboard/SidebarHoverMenuItem.tsx`)
Client component. Replaces the plain `SidebarMenuItem` rows for collections and tags.
- On `mouseEnter`: reads `getBoundingClientRect()` of the trigger, computes viewport-safe `top` position, shows a `position: fixed` popup to the right of the sidebar
- Fetches notes from `GET /api/dashboard/collection/[id]/notes` or `GET /api/dashboard/tag/[id]/notes` on first hover; results cached in a `useRef` so re-hovering doesn't re-fetch
- Popup animates in via `max-height` + `opacity` CSS transitions
- Click handler reads `window.location.search` to detect if already on workbench; if so, merges into existing tabs; otherwise navigates fresh to workbench

### `AppColCard`, `AppTagCard`
Display-only server-safe components. No mutations. Link to collection/tag pages respectively.

---

## CRUD Coverage Matrix

| Operation | Note | Collection | Tag |
|---|---|---|---|
| Create | POST `/api/dashboard/note` | POST `/api/dashboard/collection` | POST `/api/dashboard/tag` |
| Read (list) | `lib/db/notes.ts` helpers | `lib/db/collections.ts` helpers | `lib/db/tags.ts` helpers |
| Read (single) | GET `/api/dashboard/note/[id]` | `getCollectionWithNotes()` | `getTagWithNotes()` |
| Read (notes for hover) | — | GET `/api/dashboard/collection/[id]/notes` | GET `/api/dashboard/tag/[id]/notes` |
| Update | PUT `/api/dashboard/note/[id]` | — | — |
| Delete | DELETE `/api/dashboard/note/[id]` | — | — |

Collection and tag update/delete are not yet implemented.

---

## Auth & Validation Pattern

Every API route handler:
1. Calls `requireUserId()` (from `src/lib/auth-utils.ts`) — throws/redirects if unauthenticated
2. Validates the request body with a Zod schema before any Prisma call
3. Re-checks record ownership on GET/PUT/DELETE (`findFirst` with `userId` filter) before returning data or mutating

All `lib/db/` query functions also accept `userId` as a parameter — ownership is always enforced at the query level, never trusted from client input.
