-- Reverse tag→note lookups (NoteTag join filtered by tagId) previously had no
-- index; only the composite PK @@id([noteId, tagId]) existed, whose leading
-- column is noteId. Add a dedicated index on tagId.
CREATE INDEX "NoteTag_tagId_idx" ON "NoteTag"("tagId");
