-- Prisma's drift detection dropped this index in the prior migration
-- (20260709035928_default_new_users_to_pro) because a vector index on an
-- `Unsupported("vector(1536)")` field isn't representable in schema.prisma,
-- so `prisma migrate dev` saw it as unmanaged drift. Recreate it here.
-- See prisma/migrations/20260708083541_add_note_embedding_hnsw_index for the original.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "note_embedding_hnsw_idx"
  ON "Note" USING hnsw (embedding vector_cosine_ops);
