import { User, Note, Collection, Tag } from "@/types/dashboard";

export const MOCK_USER: User = {
  id: "user-1",
  email: "john.doe@example.com",
  name: "John Doe",
  isPro: true,
};

export const MOCK_TAGS: Tag[] = [
  { id: "tag-1", name: "React", noteCount: 24, isAiGenerated: false },
  { id: "tag-2", name: "TypeScript", noteCount: 17, isAiGenerated: false },
  { id: "tag-3", name: "API Design", noteCount: 9, isAiGenerated: false },
  { id: "tag-4", name: "Database", noteCount: 8, isAiGenerated: false },
  { id: "tag-5", name: "Authentication", noteCount: 6, isAiGenerated: false },
  { id: "tag-6", name: "Performance", noteCount: 5, isAiGenerated: false },
  { id: "tag-7", name: "Testing", noteCount: 4, isAiGenerated: false },
  { id: "tag-8", name: "CSS", noteCount: 11, isAiGenerated: false },
];

export const MOCK_COLLECTIONS: Collection[] = [
  { id: "col-1", name: "Web Development", noteCount: 8, isFavorite: true },
  { id: "col-2", name: "Machine Learning", noteCount: 6, isFavorite: false },
  { id: "col-3", name: "Design Systems", noteCount: 3, isFavorite: true },
  { id: "col-4", name: "Meeting Notes", noteCount: 15, isFavorite: false },
  { id: "col-5", name: "Testing", noteCount: 7, isFavorite: false },
];

export const MOCK_NOTES: Note[] = [
  {
    id: "note-1",
    title: "React Server Components Guide",
    content:
      "React Server Components allow you to write UI that can be rendered and optionally cached on the server. Security...",
    isPinned: true,
    isFavorite: false,
    collectionId: "col-1",
    tags: ["tag-1", "tag-2"],
    updatedAt: "2026-03-14",
  },
  {
    id: "note-2",
    title: "PostgreSQL Performance Tips",
    content:
      "PostgreSQL Performance Optimization: Indexing Strategies – Use B-tree indexes for equality and range queries. Consider partial indexes for...",
    isPinned: true,
    isFavorite: false,
    collectionId: "col-1",
    tags: ["tag-4", "tag-6"],
    updatedAt: "2026-03-14",
  },
  {
    id: "note-3",
    title: "Weekly Team Standup Notes",
    content:
      "Team Standup - March 15 Completed: - Dashboard redesign mockups - API endpoints for user preferences - Bug fix login flow Progress...",
    isPinned: false,
    isFavorite: false,
    collectionId: "col-4",
    tags: [],
    updatedAt: "2026-03-15",
  },
  {
    id: "note-4",
    title: "Neural Network Fundamentals",
    content:
      "Neural Network Basics: A Neural Network consists of: Input layer - Hidden layers - Output layer Activation Functions - ReLU - Sigmoid...",
    isPinned: false,
    isFavorite: false,
    collectionId: "col-2",
    tags: ["tag-3"],
    updatedAt: "2026-03-14",
  },
  {
    id: "note-5",
    title: "Design Token System",
    content:
      "Design Tokens: What are Design Tokens? Design tokens are the visual design atoms of the design system – specifically, they are named entities th...",
    isPinned: false,
    isFavorite: true,
    collectionId: "col-3",
    tags: ["tag-8"],
    updatedAt: "2026-03-13",
  },
  {
    id: "note-6",
    title: "Authentication Best Practices",
    content:
      "Authentication Security: Password Storage – Never store plain text passwords – Use bcrypt or Argon2 for hashing – Implement rate limiting. Securi...",
    isPinned: false,
    isFavorite: false,
    collectionId: "col-1",
    tags: ["tag-5"],
    updatedAt: "2026-03-12",
  },
  {
    id: "note-7",
    title: "Component Testing with Vitest",
    content:
      "Testing React Components: Setup: Install Vitest + @testing-library/react. Writing Tests for React: import { render, screen } from '@testing-l...",
    isPinned: false,
    isFavorite: false,
    collectionId: "col-5",
    tags: ["tag-7", "tag-1"],
    updatedAt: "2026-03-11",
  },
  {
    id: "note-8",
    title: "Transformer Architecture Notes",
    content:
      "Transformers in NLP: Self-Attention Mechanism: The key innovation of transformers is the self-attention mechanism that allows the model to...",
    isPinned: false,
    isFavorite: false,
    collectionId: "col-2",
    tags: [],
    updatedAt: "2026-03-10",
  },
];
