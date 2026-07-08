"use client";

import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchResultNote {
  id: string;
  title: string;
  updatedAt: string;
  similarity?: number;
}

interface Props {
  note: SearchResultNote;
  active?: boolean;
  onSelect: (note: SearchResultNote) => void;
}

export default function SearchResultRow({ note, active, onSelect }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const updated = new Date(note.updatedAt).toLocaleDateString("zh-TW");

  // Keep the keyboard-highlighted row visible when navigating a long list.
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <button
      ref={ref}
      // Use onMouseDown so selection fires before the input's blur/outside-click.
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(note);
      }}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 text-left transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
      )}
    >
      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate flex-1 text-sm">{note.title}</span>
      {note.similarity !== undefined && (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {Math.round(note.similarity * 100)}%
        </span>
      )}
      <span className="shrink-0 text-xs text-muted-foreground">{updated}</span>
    </button>
  );
}
