import { getRecentNotes } from "@/lib/db/notes";
import AppNoteCard from "./AppNoteCard";
import { Plus } from "lucide-react";
import { Tag } from "@/types/dashboard";
const AppRecentNotes = async ({
  userId,
  tags,
}: {
  userId: string;
  tags: Tag[];
}) => {
  const notes = await getRecentNotes(userId, 3);
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-48 h-full py-8 border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 group hover:border-muted-foreground/40 transition-colors cursor-pointer">
        <div className="p-3 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-muted-foreground italic">
          Add new notes...
        </span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="min-h-28 bg-background flex justify-center items-center border border-muted-foreground/20 rounded-xl transition-transform duration-200 hover:scale-105 cursor-pointer">
        <Plus className="w-12 h-12 text-muted-foreground" />
      </div>
      {notes.map((note) => {
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
};

export default AppRecentNotes;
