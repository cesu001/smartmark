import AppNoteCard from "@/components/dashboard/AppNoteCard";
import { requireUserId } from "@/lib/auth-utils";
import { getPinnedNotes } from "@/lib/db/notes";
import { getAllTags } from "@/lib/db/tags";
import { Plus } from "lucide-react";

export default async function Page() {
  const userId = await requireUserId();
  const notes = await getPinnedNotes(userId);
  const tags = await getAllTags(userId);
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
      <div className="flex flex-col items-center justify-center min-h-48 h-full py-8 border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 group hover:border-muted-foreground/40 transition-colors cursor-pointer">
        <div className="p-3 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-muted-foreground italic">
          Add new note...
        </span>
      </div>
      {notes.length > 0 &&
        notes.map((note) => {
          const encodedTitle = encodeURIComponent(note.title);
          return (
            <AppNoteCard
              key={note.id}
              note={note}
              tags={tags}
              encodedTitle={encodedTitle}
            />
          );
        })}
    </div>
  );
}
