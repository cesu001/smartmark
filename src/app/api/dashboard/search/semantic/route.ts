import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, requireProUser, ForbiddenError } from "@/lib/auth-utils";
import { applyRateLimit, aiSearchLimiter } from "@/lib/rate-limit";
import { embedText } from "@/lib/ai/embeddings";
import {
  searchNotesByTitle,
  searchNotesByContent,
  searchNotesByEmbedding,
} from "@/lib/db/notes";
import { searchCollectionsByTitle } from "@/lib/db/collections";
import { searchTagsByTitle } from "@/lib/db/tags";

// Discard semantic matches below this cosine similarity so an unrelated query
// doesn't return noise. Title matches are exempt — they always show.
// Calibrated empirically for text-embedding-3-small: a genuinely related
// query scored ~0.61 while an unrelated one scored <0.05, so 0.35 keeps
// related (and loosely-related) notes while excluding noise. The spec's
// original 0.75 was far too high for this model — it rejected real matches.
const SIMILARITY_THRESHOLD = 0.35;

const searchSchema = z.object({
  query: z.string().min(1).max(500),
  // "normal" = plain DB matching (title, content, collections, tags), no AI.
  // "semantic" = embedding nearest-neighbour search (Pro-gated).
  mode: z.enum(["normal", "semantic"]).default("normal"),
});

const EMPTY_RESPONSE = {
  titleMatches: [],
  contentMatches: [],
  semanticMatches: [],
  collectionMatches: [],
  tagMatches: [],
};

export async function POST(request: Request) {
  const userId = await requireUserId();

  try {
    const body = await request.json();
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const query = parsed.data.query.trim();
    const mode = parsed.data.mode;

    // Semantic search is the only AI-backed path, so it's the only one behind
    // the Pro gate. Normal (title/content/collection/tag) search is plain DB
    // matching and available to every signed-in user.
    if (mode === "semantic") {
      await requireProUser(userId);
    }

    const limited = await applyRateLimit(aiSearchLimiter, userId);
    if (limited) return limited;

    if (!query) {
      return NextResponse.json(EMPTY_RESPONSE);
    }

    if (mode === "semantic") {
      // Semantic embedding can fail (quota, outage); degrade to an empty list
      // rather than 500ing the request.
      let semanticMatches: Awaited<ReturnType<typeof searchNotesByEmbedding>> = [];
      try {
        const queryEmbedding = await embedText(query);
        const matches = await searchNotesByEmbedding(userId, queryEmbedding);
        semanticMatches = matches.filter(
          (n) => (n.similarity ?? 0) >= SIMILARITY_THRESHOLD,
        );
      } catch (err) {
        console.error("Semantic search failed (returning no matches):", err);
      }
      return NextResponse.json({ ...EMPTY_RESPONSE, semanticMatches });
    }

    // Normal mode: title, content, collections, tags — all plain DB queries.
    // Each section matches independently, so a note matching both its title and
    // its content intentionally appears in both Title Matches and Content Matches.
    const [titleMatches, contentMatches, collectionMatches, tagMatches] =
      await Promise.all([
        searchNotesByTitle(userId, query),
        searchNotesByContent(userId, query),
        searchCollectionsByTitle(userId, query),
        searchTagsByTitle(userId, query),
      ]);

    return NextResponse.json({
      ...EMPTY_RESPONSE,
      titleMatches,
      contentMatches,
      collectionMatches,
      tagMatches,
    });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("Search failed:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
