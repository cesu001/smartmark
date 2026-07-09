import { NextResponse } from "next/server";
import { requireUserId, requireProUser, ForbiddenError } from "@/lib/auth-utils";
import { applyRateLimit, aiSummaryLimiter } from "@/lib/rate-limit";
import { getNoteDetail } from "@/lib/db/notes";
import { summarizeNoteContent } from "@/lib/ai/summarize";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  try {
    const note = await getNoteDetail(id, userId);
    if (!note) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await requireProUser(userId);

    const limited = await applyRateLimit(aiSummaryLimiter, userId);
    if (limited) return limited;

    const content = note.content.trim();
    if (!content) {
      return NextResponse.json(
        { error: "Note has no content to summarize" },
        { status: 400 },
      );
    }

    const summary = await summarizeNoteContent(content);
    return NextResponse.json({ summary });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("Note summary failed:", err);
    return NextResponse.json({ error: "Summary failed" }, { status: 500 });
  }
}
