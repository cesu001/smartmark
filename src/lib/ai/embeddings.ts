import { embed } from "ai";
import type { Tiktoken } from "js-tiktoken";
import { prisma } from "@/lib/db";
import { EMBEDDING_MODEL } from "./client";

// text-embedding-3-small hard-limits at 8192 tokens per input. A char-based cap
// can't enforce this across languages — Traditional Chinese tokenizes at ~1–2.5
// tokens/char, so a char count safe for English overflows for CJK. We truncate
// by actual token count instead, leaving a small margin under 8192.
const MAX_EMBED_TOKENS = 8000;

// text-embedding-3-small uses the cl100k_base encoding. Lazily dynamic-import
// js-tiktoken so its ~1.7MB rank table only loads the first time we actually
// embed — not on every server component render that transitively imports this.
let encoderPromise: Promise<Tiktoken> | null = null;
function getEncoder(): Promise<Tiktoken> {
  encoderPromise ??= import("js-tiktoken").then((m) =>
    m.getEncoding("cl100k_base"),
  );
  return encoderPromise;
}

async function truncateToTokenLimit(text: string): Promise<string> {
  const encoder = await getEncoder();
  const tokens = encoder.encode(text);
  if (tokens.length <= MAX_EMBED_TOKENS) return text;
  return encoder.decode(tokens.slice(0, MAX_EMBED_TOKENS));
}

/**
 * Embed an arbitrary piece of text into a 1536-dim vector.
 * Shared by the note-save pipeline and the search query path.
 */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: await truncateToTokenLimit(text),
  });
  return embedding;
}

/**
 * Compute and persist the embedding for a note's content.
 * No-ops on empty/whitespace-only content. Writes via raw SQL because the
 * `embedding` column is `Unsupported("vector(1536)")` and invisible to the
 * normal Prisma Client — the array is cast to `::vector` from its text literal.
 */
export async function embedNoteContent(
  noteId: string,
  text: string,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const embedding = await embedText(trimmed);
  const vectorLiteral = `[${embedding.join(",")}]`;

  await prisma.$executeRaw`
    UPDATE "Note" SET embedding = ${vectorLiteral}::vector WHERE id = ${noteId}
  `;
}
