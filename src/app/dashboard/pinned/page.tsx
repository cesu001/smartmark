import AppNoteCard from "@/components/dashboard/AppNoteCard";
import { requireUserId } from "@/lib/auth-utils";
import { getPinnedNotes } from "@/lib/db/notes";

export default async function Page() {
  const userId = await requireUserId();
  const notes = await getPinnedNotes(userId);
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto p-1">
      {notes.length === 0 && (
        <div className="col-span-full flex items-center justify-center min-h-48 border border-dashed border-muted-foreground/20 rounded-xl">
          <span className="text-sm text-muted-foreground italic">
            No pinned notes yet.
          </span>
        </div>
      )}
      {notes.map((note) => {
        const encodedTitle = encodeURIComponent(note.title);
        return (
          <AppNoteCard key={note.id} note={note} encodedTitle={encodedTitle} />
        );
      })}
    </div>
  );
}
