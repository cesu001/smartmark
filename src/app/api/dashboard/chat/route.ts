import {
  streamText,
  createUIMessageStreamResponse,
  toUIMessageStream,
  convertToModelMessages,
  safeValidateUIMessages,
} from "ai";
import { requireUserId, requireProUser, ForbiddenError } from "@/lib/auth-utils";
import { applyRateLimit, aiChatLimiter } from "@/lib/rate-limit";
import { CHAT_MODEL } from "@/lib/ai/client";
import { embedText } from "@/lib/ai/embeddings";
import { searchNotesByEmbedding } from "@/lib/db/notes";
import {
  extractLastUserText,
  buildGroundedSystemPrompt,
  MAX_CONTEXT_NOTES,
  GROUNDING_EXCERPT_CHARS,
} from "@/lib/ai/chat";

export const maxDuration = 30;

export async function POST(request: Request) {
  const userId = await requireUserId();

  try {
    await requireProUser(userId);

    // useChat's transport reads the response body as the Error message on a
    // non-ok response, so re-wrap the shared helper's `{ error }` JSON as
    // plain text rather than surfacing raw JSON in the chat UI.
    const limited = await applyRateLimit(aiChatLimiter, userId);
    if (limited) {
      const body = await limited.json().catch(() => null);
      return new Response(body?.error ?? "Too many requests. Please slow down.", {
        status: limited.status,
        headers: limited.headers,
      });
    }

    const requestBody = await request.json().catch(() => null);
    // The AI SDK's own validator, not a hand-rolled Zod schema — UIMessage's
    // shape (parts unions, tool calls, etc.) is exactly what it's built to check.
    const validated = await safeValidateUIMessages({ messages: requestBody?.messages });
    if (!validated.success) {
      return new Response("Invalid request.", { status: 400 });
    }
    const messages = validated.data;

    const queryText = extractLastUserText(messages);

    let system = buildGroundedSystemPrompt([]);
    if (queryText) {
      // Grounding is best-effort: an embedding/DB failure here shouldn't stop
      // the assistant from replying, just from citing the user's notes.
      try {
        const queryEmbedding = await embedText(queryText);
        const matches = await searchNotesByEmbedding(
          userId,
          queryEmbedding,
          MAX_CONTEXT_NOTES,
          GROUNDING_EXCERPT_CHARS,
        );
        system = buildGroundedSystemPrompt(matches);
      } catch (err) {
        console.error("Chat grounding failed (continuing without note context):", err);
      }
    }

    const result = streamText({
      model: CHAT_MODEL,
      system,
      messages: await convertToModelMessages(messages),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return new Response(err.message, { status: 403 });
    }
    console.error("Chat failed:", err);
    return new Response("Chat failed. Please try again.", { status: 500 });
  }
}
