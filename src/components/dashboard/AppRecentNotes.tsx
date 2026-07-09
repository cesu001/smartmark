import { getRecentNotes } from "@/lib/db/notes";
import AppNoteCard from "./AppNoteCard";
import AddNoteTile from "./AddNoteTile";

const AppRecentNotes = async ({ userId }: { userId: string }) => {
  const notes = await getRecentNotes(userId, 3);
  if (notes.length === 0) {
    return <AddNoteTile variant="empty" />;
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <AddNoteTile variant="compact" />
      {notes.map((note) => {
        const encodedTitle = encodeURIComponent(note.title);
        return (
          <AppNoteCard key={note.id} note={note} encodedTitle={encodedTitle} />
        );
      })}
    </div>
  );
};

export default AppRecentNotes;
