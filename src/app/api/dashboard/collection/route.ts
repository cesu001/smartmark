import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-utils";
import { getAllCollections, createCollection } from "@/lib/db/collections";

export async function GET() {
  const userId = await requireUserId();
  const collections = await getAllCollections(userId);
  return NextResponse.json(collections);
}

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const userId = await requireUserId();

  const body = await request.json();
  const parsed = createCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const collection = await createCollection(userId, parsed.data.name);
  return NextResponse.json(collection, { status: 201 });
}
