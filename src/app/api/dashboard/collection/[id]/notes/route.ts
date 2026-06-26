import { requireUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const collection = await prisma.collection.findFirst({
    where: { id, userId },
    select: {
      notes: {
        select: { id: true, title: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(collection.notes);
}
