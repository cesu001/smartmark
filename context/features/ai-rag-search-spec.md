# AI RAG Search (Semantic Note Search)

## Overview

Let users type a natural-language query into the right-sidebar search box (per `project-overview.md`'s "關聯搜尋框") and get back notes ranked by semantic similarity, not just keyword match. Also owns the embedding-on-save pipeline that the AI Chatbot feature will reuse for grounding answers in the user's notes. Depends on **AI Setup** landing first (`requireProUser`, rate limiters, `src/lib/ai/client.ts`).

## Requirements

### Embedding pipeline

- Add `src/lib/ai/embeddings.ts` with `embedNoteContent(noteId, text)`:
  - Uses `embed()` from `ai` with `EMBEDDING_MODEL`
  - Writes the result via `prisma.$executeRaw` (the `embedding` column is `Unsupported("vector(1536)")`, invisible to normal Prisma Client calls — cast the array literal to `::vector`)
  - No-op on empty/whitespace-only content
- Call it from `createNote`/`updateNote` in `src/lib/db/notes.ts`, after the note write succeeds
  - Wrap in `.catch()` so an embedding failure never blocks the note save (same pattern as R2 cleanup not blocking account deletion in `deleteUser`)
  - Cap/truncate content before sending — `text-embedding-3-small` hard-limits at 8192 tokens per input

### Search

- Add `searchNotesByEmbedding(userId, queryEmbedding, limit = 10)` to `src/lib/db/notes.ts`:
  - `$queryRaw`, ordered by pgvector's `<=>` cosine-distance operator
  - Scoped by `userId` (ownership enforcement, same as every other query in this file)
  - Returns `{ id, title, updatedAt, similarity }[]`
- Add a **title-match query** (e.g. `searchNotesByTitle(userId, query, limit)`) — case-insensitive substring match on the raw query text against `Note.title`, `userId`-scoped, returns `{ id, title, updatedAt }[]`
- New route `POST /api/dashboard/search/semantic`:
  - `requireUserId()` → `requireProUser()` → `applyRateLimit(aiSearchLimiter, userId)` → Zod-validate `{ query: string }` → run both the title-match query and (embed → semantic) search → return **two separate lists**: `{ titleMatches, semanticMatches }`
- Apply a minimum similarity threshold (e.g. discard below ~0.75) to the **semantic** list only, so an unrelated query doesn't return noise; title matches always show

### Frontend

- Add the search bar to the **mid-top of the page** (top-center), not the right sidebar
- Show results in a **single dropdown menu** (opens below the bar) split into **two sections**: top = title matches, bottom = semantic matches
- Create a **new result-row component** (do not reuse `AppNoteCard`) that shows the note title and last-updated time; for semantic rows show the similarity score subtly (muted percentage)
- Debounced input, loading spinner while embedding + searching

## Notes

- Requires the HNSW index from the **AI Setup** spec to be in place before this lands, or search will do a full sequential scan.
- Treat this as the foundation the Chatbot feature reuses for retrieval — don't duplicate the embedding/search logic there.
- Full rationale: `docs/ai-integration-plan.md` §3–4.
