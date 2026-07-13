import "dotenv/config";
import { prisma } from "@/lib/db";
import { embedNoteContent } from "@/lib/ai/embeddings";

/**
 * One-off backfill: generate embeddings for notes that have content but no
 * embedding yet. These are notes created via `prisma db seed` (which never
 * runs the embedding path) or last edited before the AI RAG Search feature
 * shipped. Without an embedding a note is invisible to semantic search and
 * the AI chatbot, since both filter `WHERE embedding IS NOT NULL`.
 *
 * Reuses the app's real `embedNoteContent()` so backfilled vectors are
 * identical to what a normal note save produces. Idempotent — re-running only
 * touches notes that are still missing an embedding.
 *
 *   npx tsx scripts/backfill-embeddings.ts
 */

// `embedding` is `Unsupported("vector(1536)")` and invisible to Prisma Client,
// so we can't filter on it via `findMany` — use raw SQL to list candidates.
async function main() {
  const candidates = await prisma.$queryRaw<
    { id: string; title: string; content: string }[]
  >`
    SELECT id, title, content
    FROM "Note"
    WHERE embedding IS NULL
      AND content IS NOT NULL
      AND length(trim(content)) > 0
    ORDER BY "createdAt"
  `;

  if (candidates.length === 0) {
    console.log("✓ Nothing to backfill — every content note already has an embedding.");
    return;
  }

  console.log(`Backfilling embeddings for ${candidates.length} note(s)...\n`);

  let ok = 0;
  let failed = 0;
  for (const note of candidates) {
    try {
      await embedNoteContent(note.id, note.content);
      ok++;
      console.log(`  ✓ ${note.title} (${note.id})`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${note.title} (${note.id}):`, err);
    }
  }

  console.log(`\nDone. Embedded ${ok} note(s), ${failed} failure(s).`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
