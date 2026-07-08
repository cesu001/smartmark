import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}
export async function requireUserId() {
  const user = await requireUser();
  return user.id;
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// AI routes must call this right after requireUserId(). Queries the DB
// directly rather than trusting the session/JWT, matching the fix already
// applied twice for stale userName/image in the sidebar.
export async function requireProUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  if (!user?.isPro) {
    throw new ForbiddenError("This feature requires a Pro subscription");
  }
}
