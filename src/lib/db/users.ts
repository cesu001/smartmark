import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { deleteFromR2 } from "@/lib/r2";

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
    },
  });
}

export async function getUserStats(userId: string) {
  const [notes, favNotes, collections, favCollections, tags, favTags] =
    await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.note.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
      prisma.tag.count({ where: { userId } }),
      prisma.tag.count({ where: { userId, isFavorite: true } }),
    ]);
  return {
    notes,
    collections,
    tags,
    favorites: favNotes + favCollections + favTags,
  };
}

export async function updateUserName(userId: string, name: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { name } });
}

export async function getUserAvatarKey(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarKey: true },
  });
  return user?.avatarKey ?? null;
}

export async function updateUserAvatar(
  userId: string,
  image: string,
  avatarKey: string,
): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { image, avatarKey } });
}

export async function deleteUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarKey: true },
  });
  if (user?.avatarKey) {
    await deleteFromR2(user.avatarKey).catch((error) =>
      console.error("AVATAR_DELETE_ON_ACCOUNT_DELETE_ERROR", error),
    );
  }
  await prisma.user.delete({ where: { id: userId } });
}

export type ChangePasswordResult = "no_password" | "invalid" | "ok";

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user?.password) return "no_password";

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return "invalid";

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  return "ok";
}
