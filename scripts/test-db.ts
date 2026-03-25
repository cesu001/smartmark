import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@smartmark.dev",
    },
  });
  console.log("✓ Created user:", user.id);

  // Create a collection
  const collection = await prisma.collection.create({
    data: {
      name: "Test Collection",
      userId: user.id,
    },
  });
  console.log("✓ Created collection:", collection.id);

  // Create a note
  const note = await prisma.note.create({
    data: {
      title: "Test Note",
      content: "Hello from SmartMark!",
      userId: user.id,
      collectionId: collection.id,
    },
  });
  console.log("✓ Created note:", note.id);

  // Read back
  const fetched = await prisma.note.findUnique({
    where: { id: note.id },
    include: { collection: true, user: true },
  });
  console.log("\n✓ Fetched note:", fetched?.title);
  console.log("  Collection:", fetched?.collection?.name);
  console.log("  User:", fetched?.user?.name);

  // Clean up
  await prisma.user.delete({ where: { id: user.id } });
  console.log("\n✓ Cleaned up test data");

  console.log("\nAll tests passed!");
}

main()
  .catch((e) => {
    console.error("Database test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
