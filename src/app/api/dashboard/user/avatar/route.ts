import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-utils";
import { getUserAvatarKey, updateUserAvatar } from "@/lib/db/users";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";
import { validateAvatarFile } from "@/lib/avatar";

export async function POST(request: Request) {
  const user = await requireUser();
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateAvatarFile(file.name, file.size, file.type);
    if (!validation.valid || !validation.extension) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `avatars/${user.id}-${crypto.randomUUID()}.${validation.extension}`;

    const oldKey = await getUserAvatarKey(user.id);
    const url = await uploadToR2(key, buffer, file.type);
    await updateUserAvatar(user.id, url, key);

    if (oldKey) {
      await deleteFromR2(oldKey).catch((error) =>
        console.error("AVATAR_OLD_FILE_DELETE_ERROR", error),
      );
    }

    return NextResponse.json({ image: url });
  } catch (error) {
    console.error("AVATAR_UPLOAD_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
