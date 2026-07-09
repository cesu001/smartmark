-- DropIndex
DROP INDEX "note_embedding_hnsw_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isPro" SET DEFAULT true;
