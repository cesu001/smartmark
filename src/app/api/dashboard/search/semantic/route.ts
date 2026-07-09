import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, requireProUser, ForbiddenError } from "@/lib/auth-utils";
import { applyRateLimit, aiSearchLimiter } from "@/lib/rate-limit";
import { embedText } from "@/lib/ai/embeddings";
import {
  searchNotesByTitle,
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
});

export async function POST(request: Request) {
  const userId = await requireUserId();

  try {
    await requireProUser(userId);

    const limited = await applyRateLimit(aiSearchLimiter, userId);
    if (limited) return limited;

    const body = await request.json();
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const query = parsed.data.query.trim();
    if (!query) {
      return NextResponse.json({
        titleMatches: [],
        semanticMatches: [],
        collectionMatches: [],
        tagMatches: [],
      });
    }

    // Title matches never touch OpenAI, so they must survive an embedding
    // failure (quota, outage). Run the semantic half in its own try/catch and
    // degrade to an empty list rather than failing the whole request.
    const titleMatchesPromise = searchNotesByTitle(userId, query);
    const semanticPromise = (async () => {
      try {
        const queryEmbedding = await embedText(query);
        const matches = await searchNotesByEmbedding(userId, queryEmbedding);
        return matches.filter(
          (n) => (n.similarity ?? 0) >= SIMILARITY_THRESHOLD,
        );
      } catch (err) {
        console.error("Semantic half of search failed (returning title matches only):", err);
        return [];
      }
    })();
    // Collections and tags only ever get title matching, no semantic search.
    const collectionMatchesPromise = searchCollectionsByTitle(userId, query);
    const tagMatchesPromise = searchTagsByTitle(userId, query);

    const [titleMatches, semanticMatches, collectionMatches, tagMatches] =
      await Promise.all([
        titleMatchesPromise,
        semanticPromise,
        collectionMatchesPromise,
        tagMatchesPromise,
      ]);

    return NextResponse.json({
      titleMatches,
      semanticMatches,
      collectionMatches,
      tagMatches,
    });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("Semantic search failed:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
