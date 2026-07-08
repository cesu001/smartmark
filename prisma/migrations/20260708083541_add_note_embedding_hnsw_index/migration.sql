-- Speeds up pgvector cosine-distance search (`<=>`) on Note.embedding.
-- CONCURRENTLY avoids locking the table for writes; PostgreSQL migrations
-- are not transaction-wrapped by default in Prisma, so this is safe to run as-is.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "note_embedding_hnsw_idx"
  ON "Note" USING hnsw (embedding vector_cosine_ops);
