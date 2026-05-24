import { Tag } from "@/types/dashboard";
import { getPinnedNotes } from "@/lib/db/notes";
import AppNoteCard from "./AppNoteCard";
const AppPinnedNotes = async ({
  userId,
  tags,
}: {
  userId: string;
  tags: Tag[];
}) => {
  const notes = await getPinnedNotes(userId, 2);
  return (
    <div className="h-full flex flex-col gap-3">
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 h-full">
          <span className="text-sm font-medium text-muted-foreground/80 italic">
            No pinned notes yet
          </span>
        </div>
      ) : (
        notes.map((note) => (
          <AppNoteCard key={note.id} note={note} tags={tags} />
        ))
      )}
    </div>
  );
};

export default AppPinnedNotes;
