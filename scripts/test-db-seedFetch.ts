import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Fetching seed data...\n");

  // ── User ──────────────────────────────────────────────────────────────────

  const user = await prisma.user.findUnique({
    where: { email: "demo@smartmark.io" },
  });

  if (!user) {
    console.error("✗ Demo user not found. Run `npx prisma db seed` first.");
    process.exit(1);
  }

  console.log("User:");
  console.log(`  id:            ${user.id}`);
  console.log(`  name:          ${user.name}`);
  console.log(`  email:         ${user.email}`);
  console.log(`  isPro:         ${user.isPro}`);
  console.log(`  emailVerified: ${user.emailVerified}`);
  console.log(`  password hash: ${user.password?.slice(0, 20)}...`);

  // ── Collections ───────────────────────────────────────────────────────────

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: { _count: { select: { notes: true } } },
    orderBy: { name: "asc" },
  });

  console.log(`\nCollections (${collections.length}):`);
  for (const col of collections) {
    const fav = col.isFavorite ? " ★" : "";
    console.log(`  ${col.name}${fav} — ${col._count.notes} note(s)`);
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  const tags = await prisma.tag.findMany({
    where: { userId: user.id },
    include: { _count: { select: { notes: true } } },
    orderBy: { name: "asc" },
  });

  console.log(`\nTags (${tags.length}):`);
  for (const tag of tags) {
    console.log(`  ${tag.name} — ${tag._count.notes} note(s)`);
  }

  // ── Notes ─────────────────────────────────────────────────────────────────

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    include: {
      collection: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\nNotes (${notes.length}):`);
  for (const note of notes) {
    const pinned = note.isPinned ? " [pinned]" : "";
    const fav = note.isFavorite ? " [favorite]" : "";
    const tagNames = note.tags.map((nt) => nt.tag.name).join(", ") || "—";
    console.log(`  ${note.title}${pinned}${fav}`);
    console.log(`    Collection: ${note.collection?.name ?? "—"}`);
    console.log(`    Tags:       ${tagNames}`);
  }

  console.log("\nAll checks passed.");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
