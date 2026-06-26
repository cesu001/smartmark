import { requireUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const tag = await prisma.tag.findFirst({
    where: { id, userId },
    select: {
      notes: {
        select: {
          note: { select: { id: true, title: true } },
        },
        orderBy: { note: { updatedAt: "desc" } },
      },
    },
  });

  if (!tag) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tag.notes.map((n) => n.note));
}
