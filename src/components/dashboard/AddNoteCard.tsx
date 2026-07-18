"use client";

import { Plus } from "lucide-react";
import { useCreateNote } from "@/hooks/useCreateNote";

export default function AddNoteCard() {
  const { createNote } = useCreateNote();

  return (
    <div
      onClick={createNote}
      className="flex flex-col items-center justify-center min-h-48 h-full py-8 border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 group hover:border-muted-foreground/40 transition-colors cursor-pointer"
    >
      <div className="p-3 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
        <Plus className="w-8 h-8 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium text-muted-foreground italic">
        Add new note...
      </span>
    </div>
  );
}
