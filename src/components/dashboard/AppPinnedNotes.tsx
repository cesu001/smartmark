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
    <div className="flex flex-col gap-3">
      {notes.map((note) => (
        <AppNoteCard key={note.id} note={note} tags={tags} />
      ))}
    </div>
  );
};

export default AppPinnedNotes;
