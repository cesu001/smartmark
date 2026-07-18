"use client";

import { Check, Folder, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SimpleEntity {
  id: string;
  name: string;
}

interface NoteMetaBarProps {
  isEditMode: boolean;
  collections: SimpleEntity[];
  tags: SimpleEntity[];
  collectionId: string;
  selectedTagIds: string[];
  tagPopoverOpen: boolean;
  onTagPopoverOpenChange: (open: boolean) => void;
  /** Fired when the Collection select opens — used to refresh the list. */
  onCollectionOpenChange: (open: boolean) => void;
  onCollectionChange: (value: string) => void;
  onToggleTag: (tagId: string) => void;
}

/**
 * The NoteDrawer meta row: in edit mode a Collection select + a tags multi-select
 * popover; in read mode a collection chip + tag badges. Purely presentational —
 * all state lives in the parent (via useAutoSaveNote).
 */
export default function NoteMetaBar({
  isEditMode,
  collections,
  tags,
  collectionId,
  selectedTagIds,
  tagPopoverOpen,
  onTagPopoverOpenChange,
  onCollectionOpenChange,
  onCollectionChange,
  onToggleTag,
}: NoteMetaBarProps) {
  const collectionName =
    collections.find((c) => c.id === collectionId)?.name ?? null;
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  if (isEditMode) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={collectionId}
          onValueChange={onCollectionChange}
          onOpenChange={(open) => {
            if (open) onCollectionOpenChange(open);
          }}
        >
          <SelectTrigger className="h-7 w-44 text-xs">
            <SelectValue placeholder="Collection (optional)" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-xs">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={tagPopoverOpen} onOpenChange={onTagPopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <Tag className="h-3 w-3" />
              {selectedTagIds.length > 0
                ? `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? "s" : ""}`
                : "Add tags"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search tags…"
                className="h-8 text-xs"
              />
              <CommandList>
                <CommandEmpty className="text-xs py-2 text-center">
                  No tags found.
                </CommandEmpty>
                <CommandGroup>
                  {tags.map((tag) => {
                    const checked = selectedTagIds.includes(tag.id);
                    return (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        className="text-xs"
                        onSelect={() => onToggleTag(tag.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-3.5 w-3.5",
                            !checked && "opacity-0",
                          )}
                        />
                        {tag.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap min-h-7">
      {collectionName && (
        <span className="inline-flex items-center gap-1 bg-muted rounded px-2 py-0.5 text-xs text-muted-foreground">
          <Folder className="h-3 w-3" />
          {collectionName}
        </span>
      )}
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="text-xs px-1.5 py-0"
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
