# AI Chatbot

## Overview

Add the AI Chatbot panel to the right sidebar (per `project-overview.md`'s layout spec) — a conversational assistant that can answer questions about the user's notes. Depends on **AI Setup** landing first (`requireProUser`, rate limiters, `src/lib/ai/client.ts`); should land after **AI RAG Search** so it can reuse `searchNotesByEmbedding` for grounding answers, rather than duplicating retrieval logic.

## Requirements

- New route `src/app/api/dashboard/chat/route.ts`:
  - `requireUserId()` → `requireProUser()` → `applyRateLimit(aiChatLimiter, userId)`
  - `streamText()` with `CHAT_MODEL`, streamed back via `createUIMessageStreamResponse`/`toUIMessageStream`
  - `export const maxDuration = 30;` to cap runaway generations
- RAG grounding: embed the user's latest message, call `searchNotesByEmbedding` (from the RAG Search feature), and inject the top matches into the `system` prompt as delimited context (not raw-concatenated) so the model can reference the user's actual notes
  - Cap injected context to the top 3-5 matches, title + short excerpt only — not full note bodies, to keep input tokens bounded regardless of note collection size
- Frontend: chatbot UI in the right sidebar using `useChat` from `@ai-sdk/react` + `TextStreamChatTransport`
  - Standard chat UI: message list, input box, streaming indicator
  - Error state via sonner toast, consistent with the rest of the dashboard

## Security

- Retrieved note content injected into the system prompt is user-authored and must be treated as data, not instructions — same prompt-injection guard as the Summarizing feature.
- Never expose `OPENAI_API_KEY` client-side; all calls happen server-side in the route handler.

## Notes

- If RAG Search hasn't landed yet, this can ship first with a plain system prompt (no note grounding) and have retrieval wired in as a follow-up — but don't duplicate the embedding/search code inline in the chat route if that's the sequencing chosen.
- Full rationale: `docs/ai-integration-plan.md` §6, §9, §10.
