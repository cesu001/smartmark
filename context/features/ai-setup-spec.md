# AI Setup (Foundation)

## Overview

Shared infrastructure that the AI Chatbot, Summarizing, and RAG Search features all build on. No user-facing feature in this branch — just the SDK, client, gating, and rate-limit scaffolding. Full research/rationale in `docs/ai-integration-plan.md`.

**Decision: use the Vercel AI SDK (`ai` + `@ai-sdk/openai`) for every AI call — embeddings, generation, and streaming alike.** Do not add the raw `openai` package. One SDK means one client config, one error shape, one mocking strategy across all three features.

## Requirements

- Install `ai`, `@ai-sdk/openai`, `@ai-sdk/react`
- Create `src/lib/ai/client.ts`:
  - `createOpenAI({ apiKey: process.env.OPENAI_API_KEY })`
  - Export `CHAT_MODEL` = `openai("gpt-5.4-nano")`
  - Export `EMBEDDING_MODEL` = `openai.textEmbeddingModel("text-embedding-3-small")`
- `OPENAI_API_KEY` is already documented in `.env.example` — no new env var needed
- Add `requireProUser(userId)` to `src/lib/auth-utils.ts`, next to `requireUserId()`
  - Query `User.isPro` directly from the DB — do **not** trust the session/JWT (same staleness class of bug already fixed twice for `userName`/`image`)
  - Throws/returns 403 when `isPro` is false
  - This does not exist anywhere in the codebase yet — every AI route needs it as the second line, right after `requireUserId()`
- Add AI-specific limiters to `src/lib/rate-limit.ts` (reuse existing `applyRateLimit()` helper, same fail-open behavior):
  - `aiChatLimiter` — 20 requests / 1 hour
  - `aiSummaryLimiter` — 30 requests / 1 hour
  - `aiSearchLimiter` — 60 requests / 1 hour
- Add an HNSW index migration for `Note.embedding` (the column and `vector` extension already exist from `0001_initial`, but no index has been created yet):
  ```sql
  CREATE INDEX CONCURRENTLY IF NOT EXISTS note_embedding_hnsw_idx
    ON "Note" USING hnsw (embedding vector_cosine_ops);
  ```
  Use `prisma migrate dev --create-only` and hand-edit the generated empty migration (Prisma schema syntax can't express `USING hnsw`), matching how `0001_initial` already hand-writes `CREATE EXTENSION`.

## Notes

- Keep everything as Route Handlers (`src/app/api/...`), not Server Actions — matches the existing convention (no `src/actions/` directory exists in this repo despite `coding-standards.md` describing that pattern), and the chatbot's streaming response needs a Route Handler regardless.
- This branch should land before Chatbot/Summarizing/RAG Search start, since all three depend on `requireProUser`, the rate limiters, and `src/lib/ai/client.ts`.
