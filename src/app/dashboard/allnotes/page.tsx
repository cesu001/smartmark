import AppNoteCard from "@/components/dashboard/AppNoteCard";
import AddNoteCard from "@/components/dashboard/AddNoteCard";
import LoadMoreNotes from "@/components/dashboard/LoadMoreNotes";
import { requireUserId } from "@/lib/auth-utils";
import { getAllNotes } from "@/lib/db/notes";

export default async function Page() {
  const userId = await requireUserId();
  const { notes, nextCursor } = await getAllNotes(userId);
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto p-1">
      <AddNoteCard />
      {notes.length > 0 &&
        notes.map((note) => {
          const encodedTitle = encodeURIComponent(note.title);
          return (
            <AppNoteCard key={note.id} note={note} encodedTitle={encodedTitle} />
          );
        })}
      {/*
        Keyed on the cursor so that when the server-rendered first page shifts
        (e.g. a note on it is deleted, pulling the next note backward into it),
        this remounts and drops its appended pages instead of rendering that
        note twice.
      */}
      {nextCursor && (
        <LoadMoreNotes key={nextCursor} scope="all" initialCursor={nextCursor} />
      )}
    </div>
  );
}
