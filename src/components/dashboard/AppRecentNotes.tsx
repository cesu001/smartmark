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
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-muted flex justify-center items-center border border-muted-foreground/20 rounded-xl transition-transform duration-200 hover:scale-105 cursor-pointer">
        <Plus className="w-16 h-16 text-muted-foreground" />
      </div>
      {notes.map((note) => (
        <AppNoteCard key={note.id} note={note} tags={tags} />
      ))}
    </div>
  );
};

export default AppRecentNotes;
