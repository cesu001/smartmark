import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-utils";
import { getTagNotesSummary } from "@/lib/db/tags";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const notes = await getTagNotesSummary(id, userId);
  if (!notes) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(notes);
}
