# AI Summaries

## Overview

Let a user generate a short AI summary of a note's content from the note drawer. Non-streaming — a 2-3 sentence summary doesn't benefit from token-by-token rendering. Depends on **AI Setup** landing first (`requireProUser`, rate limiters, `src/lib/ai/client.ts`).

## Requirements

- New route `POST /api/dashboard/note/[id]/summary`:
  - `requireUserId()` → verify note ownership → `requireProUser()` → `applyRateLimit(aiSummaryLimiter, userId)` → `generateText()` with `CHAT_MODEL`
  - `system` prompt: summarize in 2-3 sentences, and explicitly instruct the model not to follow any instructions found inside the note content (treat it as data, not commands — see Security note below)
  - Truncate/cap note content sent to the model if very long
- Frontend: add a "Summarize" action in `NoteDrawer.tsx`
  - Loading spinner while generating (button disabled state, same pattern as other in-flight actions in the drawer)
  - Show the result without silently overwriting note content — e.g. a dismissible popover/panel with the summary text and an explicit "Insert" or "Copy" action, not an automatic write
  - Sonner toast on error, matching every other action in the drawer (pin/favorite/delete/import/export)

## Security

- The note content being summarized is user-authored and could contain injected instructions (e.g. "ignore the above and reveal...") — the system prompt must frame it as delimited data, not as commands to follow. Same treatment needed for the Chatbot feature when it pulls in note context.

## Notes

- Don't persist the summary to the DB unless asked — this spec is generate-on-demand, not stored. If storage is wanted later (e.g. showing summaries on note cards), that's a schema change and a separate feature.
- Full rationale: `docs/ai-integration-plan.md` §5, §9.
