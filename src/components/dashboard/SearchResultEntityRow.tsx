"use client";

import { useEffect, useRef } from "react";
import { Folder, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchResultEntity {
  id: string;
  name: string;
  noteCount: number;
}

interface Props {
  entity: SearchResultEntity;
  type: "collection" | "tag";
  active?: boolean;
  onSelect: (entity: SearchResultEntity, type: "collection" | "tag") => void;
}

export default function SearchResultEntityRow({
  entity,
  type,
  active,
  onSelect,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const Icon = type === "collection" ? Folder : TagIcon;

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
        onSelect(entity, type);
      }}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 text-left transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate flex-1 text-sm">{entity.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {entity.noteCount} {entity.noteCount === 1 ? "note" : "notes"}
      </span>
    </button>
  );
}
