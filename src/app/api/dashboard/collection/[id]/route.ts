import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-utils";
import {
  updateCollectionName,
  updateCollectionFavorite,
  deleteCollectionAndNotes,
} from "@/lib/db/collections";

type RouteContext = { params: Promise<{ id: string }> };

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

const patchCollectionSchema = z.object({
  isFavorite: z.boolean(),
});

export async function PUT(request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const body = await request.json();
  const parsed = updateCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const collection = await updateCollectionName(id, userId, parsed.data.name);
  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(collection);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const body = await request.json();
  const parsed = patchCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const collection = await updateCollectionFavorite(
    id,
    userId,
    parsed.data.isFavorite,
  );
  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(collection);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const deleted = await deleteCollectionAndNotes(id, userId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
