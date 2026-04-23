import { prisma } from "@/lib/db";

interface UserIdName {
  id: string;
  name: string | null;
  email: string | null;
}

export async function getUserInfo(): Promise<UserIdName | null> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@smartmark.io" },
    select: { id: true, name: true, email: true },
  });
  return user ?? null;
}
