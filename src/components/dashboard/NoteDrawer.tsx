"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { toast } from "sonner";
import { Check, Eye, Folder, Pencil, Plus, Save, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface SimpleCollection {
  id: string;
  name: string;
}

interface SimpleTag {
  id: string;
  name: string;
}

interface NoteData {
  id: string;
  title: string;
  content: string;
  collectionId: string | null;
  tags: { id: string; name: string }[];
}

interface NoteDrawerProps {
  noteId: string | null;
}

export default function NoteDrawer({ noteId }: NoteDrawerProps) {
  const isNewNote = !noteId;

  const [isEditMode, setIsEditMode] = useState(isNewNote);
  const [title, setTitle] = useState("Untitled Note");
  const [collectionId, setCollectionId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<SimpleCollection[]>([]);
  const [tags, setTags] = useState<SimpleTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  // Store content to set once editor is ready
  const pendingContent = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: "",
    editable: isEditMode,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-6 py-4 min-h-[300px]",
      },
    },
    onCreate({ editor }) {
      if (pendingContent.current !== null) {
        editor.commands.setContent(pendingContent.current);
        pendingContent.current = null;
      }
    },
  });

  // Sync edit mode → editor editable state
  useEffect(() => {
    editor?.setEditable(isEditMode);
  }, [editor, isEditMode]);

  // Load collections and tags once on mount
  useEffect(() => {
    async function loadMeta() {
      const [colRes, tagRes] = await Promise.all([
        fetch("/api/dashboard/collection"),
        fetch("/api/dashboard/tag"),
      ]);
      if (colRes.ok) setCollections(await colRes.json());
      if (tagRes.ok) setTags(await tagRes.json());
    }
    loadMeta();
  }, []);

  const setEditorContent = useCallback(
    (content: string) => {
      if (editor) {
        editor.commands.setContent(content);
      } else {
        pendingContent.current = content;
      }
    },
    [editor],
  );

  // Load note data when noteId changes
  useEffect(() => {
    if (!noteId) {
      setTitle("Untitled Note");
      setCollectionId("");
      setSelectedTagIds([]);
      setEditorContent("");
      setIsEditMode(true);
      return;
    }

    setIsEditMode(false);

    async function loadNote() {
      const res = await fetch(`/api/dashboard/note/${noteId}`);
      if (!res.ok) {
        toast.error("Failed to load note");
        return;
      }
      const note: NoteData = await res.json();
      setTitle(note.title);
      setCollectionId(note.collectionId ?? "");
      setSelectedTagIds(note.tags.map((t) => t.id));
      setEditorContent(note.content ?? "");
    }
    loadNote();
  }, [noteId, setEditorContent]);

  async function handleSubmit() {
    if (!collectionId) {
      toast.error("Please select a collection");
      return;
    }

    // tiptap-markdown doesn't export storage types; any is intentional here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = ((editor?.storage as any)?.markdown?.getMarkdown() as string | undefined) ?? "";
    setIsSubmitting(true);

    try {
      const body = { title, collectionId, tagIds: selectedTagIds, content };
      const res = isNewNote
        ? await fetch("/api/dashboard/note", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/dashboard/note/${noteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) throw new Error();
      toast.success(isNewNote ? "Note created" : "Note saved");
      setIsEditMode(false);
    } catch {
      toast.error("Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  }

  const collectionName =
    collections.find((c) => c.id === collectionId)?.name ?? null;
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 space-y-2 bg-background">
        {/* Title + actions row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                className="text-base font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
              />
            ) : (
              <h2 className="text-base font-semibold truncate">{title}</h2>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditMode((v) => !v)}
            className="h-8 gap-1.5 shrink-0"
          >
            {isEditMode ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                Read
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </>
            )}
          </Button>
          {isEditMode && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-8 shrink-0"
            >
              {isSubmitting ? (
                "Saving…"
              ) : isNewNote ? (
                <><Plus className="h-3.5 w-3.5" />Add</>
              ) : (
                <><Save className="h-3.5 w-3.5" />Save</>
              )}
            </Button>
          )}
        </div>

        {/* Meta row */}
        {isEditMode ? (
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={collectionId} onValueChange={setCollectionId}>
              <SelectTrigger className="h-7 w-44 text-xs">
                <SelectValue placeholder="Collection (required)" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
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
                  <CommandInput placeholder="Search tags…" className="h-8 text-xs" />
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
                            onSelect={() => {
                              setSelectedTagIds((prev) =>
                                checked
                                  ? prev.filter((id) => id !== tag.id)
                                  : [...prev, tag.id],
                              );
                            }}
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
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap min-h-7">
            {collectionName && (
              <span className="inline-flex items-center gap-1 bg-muted rounded px-2 py-0.5 text-xs text-muted-foreground">
                <Folder className="h-3 w-3" />
                {collectionName}
              </span>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs px-1.5 py-0">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
