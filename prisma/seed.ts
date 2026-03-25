import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...\n");

  // ── User ──────────────────────────────────────────────────────────────────

  const hashedPassword = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@smartmark.io" },
    update: {},
    create: {
      email: "demo@smartmark.io",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  console.log("✓ User:", user.email);

  // ── Collections ───────────────────────────────────────────────────────────

  const collectionsData = [
    { name: "Web Development", isFavorite: true },
    { name: "Machine Learning", isFavorite: false },
    { name: "Design Systems", isFavorite: true },
    { name: "Meeting Notes", isFavorite: false },
    { name: "Testing", isFavorite: false },
  ];

  const collections: Record<string, string> = {};

  for (const data of collectionsData) {
    const collection = await prisma.collection.upsert({
      where: {
        // upsert by userId + name using a compound unique we simulate via findFirst
        id: (
          await prisma.collection.findFirst({
            where: { userId: user.id, name: data.name },
          })
        )?.id ?? "non-existent",
      },
      update: {},
      create: { ...data, userId: user.id },
    });
    collections[data.name] = collection.id;
  }

  console.log("✓ Collections:", Object.keys(collections).join(", "));

  // ── Tags ──────────────────────────────────────────────────────────────────

  const tagsData = [
    "React",
    "TypeScript",
    "API Design",
    "Database",
    "Authentication",
    "Performance",
    "Testing",
    "CSS",
  ];

  const tags: Record<string, string> = {};

  for (const name of tagsData) {
    const tag = await prisma.tag.upsert({
      where: {
        id: (
          await prisma.tag.findFirst({ where: { userId: user.id, name } })
        )?.id ?? "non-existent",
      },
      update: {},
      create: { name, userId: user.id, isAiGenerated: false },
    });
    tags[name] = tag.id;
  }

  console.log("✓ Tags:", Object.keys(tags).join(", "));

  // ── Notes ─────────────────────────────────────────────────────────────────

  const notesData = [
    {
      title: "React Server Components Guide",
      content:
        "# React Server Components Guide\n\nReact Server Components allow you to write UI that can be rendered and optionally cached on the server.\n\n## Key Benefits\n\n- Zero client-side JavaScript for server components\n- Direct access to server resources (DB, filesystem)\n- Improved performance and smaller bundle sizes\n\n## Usage\n\nServer components are the default in Next.js App Router. Add `'use client'` only when you need interactivity, hooks, or browser APIs.",
      isPinned: true,
      isFavorite: false,
      collectionName: "Web Development",
      tagNames: ["React", "TypeScript"],
    },
    {
      title: "PostgreSQL Performance Tips",
      content:
        "# PostgreSQL Performance Optimization\n\n## Indexing Strategies\n\n- Use B-tree indexes for equality and range queries\n- Consider partial indexes for filtered queries\n- Use composite indexes for multi-column WHERE clauses\n\n## Query Optimization\n\n- Use `EXPLAIN ANALYZE` to inspect query plans\n- Avoid `SELECT *` — only fetch needed columns\n- Use connection pooling (PgBouncer / Neon serverless driver)",
      isPinned: true,
      isFavorite: false,
      collectionName: "Web Development",
      tagNames: ["Database", "Performance"],
    },
    {
      title: "Weekly Team Standup Notes",
      content:
        "# Team Standup — March 15\n\n## Completed\n\n- Dashboard redesign mockups\n- API endpoints for user preferences\n- Bug fix: login flow edge case\n\n## In Progress\n\n- Seed script implementation\n- Auth integration with NextAuth v5\n\n## Blockers\n\n- Waiting on design review for mobile layout",
      isPinned: false,
      isFavorite: false,
      collectionName: "Meeting Notes",
      tagNames: [],
    },
    {
      title: "Neural Network Fundamentals",
      content:
        "# Neural Network Basics\n\nA Neural Network consists of:\n\n- **Input layer** — receives raw data\n- **Hidden layers** — learns features\n- **Output layer** — produces predictions\n\n## Activation Functions\n\n- **ReLU** — max(0, x), most common for hidden layers\n- **Sigmoid** — maps to (0,1), used for binary classification\n- **Softmax** — multi-class output probabilities",
      isPinned: false,
      isFavorite: false,
      collectionName: "Machine Learning",
      tagNames: ["API Design"],
    },
    {
      title: "Design Token System",
      content:
        "# Design Tokens\n\n## What are Design Tokens?\n\nDesign tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.\n\n## Types of Tokens\n\n- **Color tokens** — `--color-primary`, `--color-surface`\n- **Spacing tokens** — `--spacing-sm`, `--spacing-lg`\n- **Typography tokens** — `--font-size-base`, `--font-weight-bold`\n\n## Tooling\n\nUse CSS custom properties for v4-compatible token systems.",
      isPinned: false,
      isFavorite: true,
      collectionName: "Design Systems",
      tagNames: ["CSS"],
    },
    {
      title: "Authentication Best Practices",
      content:
        "# Authentication Security\n\n## Password Storage\n\n- Never store plain text passwords\n- Use bcrypt or Argon2 for hashing\n- Implement rate limiting on login endpoints\n\n## Session Management\n\n- Use short-lived JWTs or DB-backed sessions\n- Rotate session tokens on privilege change\n- Set `HttpOnly` and `Secure` cookie flags\n\n## OAuth\n\n- Prefer OAuth providers (Google, GitHub) to reduce credential risk\n- Always validate `state` param to prevent CSRF",
      isPinned: false,
      isFavorite: false,
      collectionName: "Web Development",
      tagNames: ["Authentication"],
    },
    {
      title: "Component Testing with Vitest",
      content:
        "# Testing React Components\n\n## Setup\n\nInstall Vitest + `@testing-library/react`:\n\n```bash\nnpm install -D vitest @testing-library/react @testing-library/user-event\n```\n\n## Writing Tests\n\n```tsx\nimport { render, screen } from '@testing-library/react'\nimport { expect, test } from 'vitest'\nimport MyComponent from './MyComponent'\n\ntest('renders correctly', () => {\n  render(<MyComponent />)\n  expect(screen.getByText('Hello')).toBeInTheDocument()\n})\n```",
      isPinned: false,
      isFavorite: false,
      collectionName: "Testing",
      tagNames: ["Testing", "React"],
    },
    {
      title: "Transformer Architecture Notes",
      content:
        "# Transformers in NLP\n\n## Self-Attention Mechanism\n\nThe key innovation of transformers is the self-attention mechanism that allows the model to weigh the importance of different tokens in a sequence relative to each other.\n\n## Architecture\n\n- **Encoder** — processes input sequence\n- **Decoder** — generates output sequence\n- **Multi-head attention** — runs attention in parallel across subspaces\n\n## Popular Models\n\n- BERT (encoder-only)\n- GPT (decoder-only)\n- T5 (encoder-decoder)",
      isPinned: false,
      isFavorite: false,
      collectionName: "Machine Learning",
      tagNames: [],
    },
  ];

  for (const { tagNames, collectionName, ...noteData } of notesData) {
    const existingNote = await prisma.note.findFirst({
      where: { userId: user.id, title: noteData.title },
    });

    const note = await prisma.note.upsert({
      where: { id: existingNote?.id ?? "non-existent" },
      update: {},
      create: {
        ...noteData,
        userId: user.id,
        collectionId: collections[collectionName],
      },
    });

    // Attach tags
    for (const tagName of tagNames) {
      const tagId = tags[tagName];
      if (!tagId) continue;

      await prisma.noteTag.upsert({
        where: { noteId_tagId: { noteId: note.id, tagId } },
        update: {},
        create: { noteId: note.id, tagId },
      });
    }

    console.log("✓ Note:", note.title);
  }

  console.log("\nSeeding complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
