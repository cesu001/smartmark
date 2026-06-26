# Item Types

SmartMark has three core content types: **Note**, **Collection**, and **Tag**. All three are user-scoped — every record carries a `userId` foreign key and is deleted when the user is deleted (`onDelete: Cascade`).

---

## Note

**Purpose:** The primary unit of content. A Markdown document that the user writes, organizes into a collection, and labels with tags.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `title` | `String` | Defaults to `"未命名筆記"` (Unnamed Note) |
| `content` | `String?` | Raw Markdown text; nullable |
| `isFavorite` | `Boolean` | User-starred; default `false` |
| `isPinned` | `Boolean` | Pinned to top of lists; default `false` |
| `embedding` | `vector(1536)?` | AI embedding from OpenAI `text-embedding-3-small`; used for semantic search |
| `userId` | `String` | Owner; cascading delete |
| `collectionId` | `String?` | Optional parent collection; set to `null` on collection delete |
| `createdAt` | `DateTime` | Auto-set on create |
| `updatedAt` | `DateTime` | Auto-updated on every save |

**Relations:** belongs to one `Collection` (optional), has many `Tag`s via the `NoteTag` join table.

**Display:** rendered as WYSIWYG Markdown in the Note Drawer editor (Tiptap + `tiptap-markdown`). Cards in list/grid views show title, truncated content preview, and tag badges. Pinned notes surface in a dedicated sidebar section and the `/dashboard/pinned` page.

---

## Collection

**Purpose:** A folder-like container for grouping notes. A note belongs to at most one collection.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `name` | `String` | User-provided label |
| `isFavorite` | `Boolean` | User-starred; default `false` |
| `userId` | `String` | Owner; cascading delete |
| `createdAt` | `DateTime` | Auto-set on create |
| `updatedAt` | `DateTime` | Auto-updated |

**Relations:** has many `Note`s (a note's `collectionId` is set to `null` when the collection is deleted — notes are not deleted).

**Display:** shown in the left sidebar under "Collections" with an inline `+` form to create new ones. Clicking navigates to `/dashboard/collection/[id]` showing all notes in that collection. Favorited collections appear on the `/dashboard/favorites` page.

**Special behavior:** when a note is auto-saved without a collection selected, the server finds or creates a `"Draft"` collection for that user automatically.

---

## Tag

**Purpose:** A label attached to notes for categorization. Tags can be created manually by the user or generated automatically by AI.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `name` | `String` | Label text |
| `isAiGenerated` | `Boolean` | `true` if created by AI auto-tagging; default `false` |
| `isFavorite` | `Boolean` | User-starred; default `false` |
| `userId` | `String` | Owner; cascading delete |

**Note:** `Tag` has no `createdAt`/`updatedAt` timestamps in the schema.

**Relations:** has many `Note`s via the `NoteTag` join table (many-to-many).

**Display:** shown in the left sidebar under "Tags" with note count badges (e.g., `React (5)`). Clicking navigates to `/dashboard/tag/[id]` showing all notes with that tag. Favorited tags appear on `/dashboard/favorites`. Tag badges render inline on note cards and in the Note Drawer.

---

## NoteTag (Join Table)

**Purpose:** Resolves the many-to-many relationship between `Note` and `Tag`.

| Field | Type | Notes |
|---|---|---|
| `noteId` | `String` | FK → `Note`; composite PK; cascading delete |
| `tagId` | `String` | FK → `Tag`; composite PK; cascading delete |

Deleting either a note or a tag automatically removes the corresponding `NoteTag` rows.

---

## Summary

### Classification

All three types are **text-based** structured records — there is no file upload or URL bookmark type in the current schema.

### Shared Properties

| Property | Note | Collection | Tag |
|---|---|---|---|
| `id` (cuid PK) | ✓ | ✓ | ✓ |
| `userId` (owner) | ✓ | ✓ | ✓ |
| `isFavorite` | ✓ | ✓ | ✓ |
| `createdAt` | ✓ | ✓ | — |
| `updatedAt` | ✓ | ✓ | — |

### Display Differences

| Type | Primary view | Card component | List location |
|---|---|---|---|
| Note | Note Drawer (Tiptap editor) | `AppNoteCard` | Sidebar, allnotes, pinned, collection, tag pages |
| Collection | `/dashboard/collection/[id]` grid | `AppColCard` | Sidebar, dashboard Recent Collections |
| Tag | `/dashboard/tag/[id]` grid | `AppTagCard` | Sidebar, dashboard Tags panel |
