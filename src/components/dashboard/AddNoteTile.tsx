"use client";

import { Plus } from "lucide-react";
import { useCreateNote } from "@/hooks/useCreateNote";

interface AddNoteTileProps {
  variant: "empty" | "compact";
}

export default function AddNoteTile({ variant }: AddNoteTileProps) {
  const { createNote } = useCreateNote();

  if (variant === "empty") {
    return (
      <div
        onClick={createNote}
        className="flex flex-col items-center justify-center min-h-48 h-full py-8 border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 group hover:border-muted-foreground/40 transition-colors cursor-pointer"
      >
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
    <div
      onClick={createNote}
      className="min-h-28 bg-background flex justify-center items-center border border-muted-foreground/20 rounded-xl transition-transform duration-200 hover:scale-105 cursor-pointer"
    >
      <Plus className="w-12 h-12 text-muted-foreground" />
    </div>
  );
}
