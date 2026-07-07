"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { toast } from "sonner";
import { Check, Eye, Folder, Import, Pencil, Save, SquareArrowRightExit, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { validateImportFile, deriveTitleFromFilename } from "@/lib/note-import";
import { buildExportContent, buildExportFilename } from "@/lib/note-export";
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
  createdAt: string;
  updatedAt: string;
}

interface NoteDrawerProps {
  noteId: string;
  startInEditMode?: boolean;
  onEditModeChange?: (isEditMode: boolean) => void;
  onTitleSaved?: (title: string) => void;
}

type SaveStatus = "idle" | "saving" | "saved";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function NoteDrawer({ noteId, startInEditMode, onEditModeChange, onTitleSaved }: NoteDrawerProps) {
  const [isEditMode, setIsEditMode] = useState(startInEditMode ?? false);
  const [title, setTitle] = useState("Untitled Note");
  const [collectionId, setCollectionId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<SimpleCollection[]>([]);
  const [tags, setTags] = useState<SimpleTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const isLoaded = useRef(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always-current save function — avoids stale closures inside setTimeout
  const doAutoSaveRef = useRef<() => Promise<boolean>>(async () => false);
  // Stable ref so the editor's onUpdate (captured once at creation) always calls the latest scheduler
  const scheduleAutoSaveRef = useRef<() => void>(() => {});

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
    onUpdate() {
      scheduleAutoSaveRef.current();
    },
  });

  // Update scheduleAutoSaveRef every render so editor's onUpdate always calls latest version
  scheduleAutoSaveRef.current = () => {
    if (!isLoaded.current) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => doAutoSaveRef.current(), 1000);
  };

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
    isLoaded.current = false;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setIsEditMode(startInEditMode ?? false);
    setTitle("Untitled Note");
    setCollectionId("");
    setSelectedTagIds([]);
    setCreatedAt(null);
    setUpdatedAt(null);
    setSaveStatus("idle");
    setEditorContent("");

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
      setCreatedAt(note.createdAt);
      setUpdatedAt(note.updatedAt);
      setEditorContent(note.content ?? "");
      isLoaded.current = true;
    }
    loadNote();

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current);
    };
  // startInEditMode intentionally omitted: only consumed on noteId change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, setEditorContent]);

  // Keep doAutoSaveRef current whenever relevant state changes
  useEffect(() => {
    doAutoSaveRef.current = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = ((editor?.storage as any)?.markdown?.getMarkdown() as string | undefined) ?? "";
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/dashboard/note/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, collectionId: collectionId || null, tagIds: selectedTagIds, content }),
        });
        if (!res.ok) throw new Error();
        const data: { id: string; collectionId: string } = await res.json();
        // Server may have assigned a Draft collection — sync it to UI
        if (data.collectionId && !collectionId) {
          setCollectionId(data.collectionId);
          fetch("/api/dashboard/collection")
            .then((r) => { if (r.ok) r.json().then(setCollections); })
            .catch(() => null);
        }
        setUpdatedAt(new Date().toISOString());
        setSaveStatus("saved");
        if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current);
        savedDisplayTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
        onTitleSaved?.(title);
        return true;
      } catch {
        setSaveStatus("idle");
        return false;
      }
    };
  }, [noteId, title, collectionId, selectedTagIds, editor, onTitleSaved]);

  async function handleSubmit() {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setIsSubmitting(true);
    const ok = await doAutoSaveRef.current();
    setIsSubmitting(false);
    if (ok) {
      setIsEditMode(false);
      onEditModeChange?.(false);
    }
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  async function handleImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validation = validateImportFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const content = await file.text();
    const newTitle = deriveTitleFromFilename(file.name);
    setTitle(newTitle);
    editor?.commands.setContent(content);
    scheduleAutoSaveRef.current();
    toast.success("File imported");
  }

  function handleExport() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = ((editor?.storage as any)?.markdown?.getMarkdown() as string | undefined) ?? "";
    const blob = new Blob([buildExportContent(content)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildExportFilename(title);
    a.click();
    URL.revokeObjectURL(url);
  }

  const collectionName = collections.find((c) => c.id === collectionId)?.name ?? null;
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));
  const isEmptyNote = editor?.isEmpty ?? true;

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
                onChange={(e) => {
                  setTitle(e.target.value);
                  scheduleAutoSaveRef.current();
                }}
                placeholder="Note title"
                className="text-base font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
              />
            ) : (
              <h2 className="text-base font-semibold truncate">{title}</h2>
            )}
          </div>
          {saveStatus === "saving" && (
            <span className="text-xs text-muted-foreground shrink-0">Saving…</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-green-500 shrink-0">Saved</span>
          )}
          {isEditMode && isEmptyNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImportClick}
              className="h-8 gap-1.5 shrink-0"
              title="Import note (.md, .txt)"
            >
              <Import className="h-3.5 w-3.5" />
            </Button>
          )}
          <input
            ref={importInputRef}
            type="file"
            accept=".md,.txt,text/markdown,text/plain"
            className="hidden"
            onChange={handleImportFileChange}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = !isEditMode;
              setIsEditMode(next);
              onEditModeChange?.(next);
            }}
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
              disabled={isSubmitting || saveStatus === "saving"}
              className="h-8 shrink-0"
            >
              {isSubmitting || saveStatus === "saving" ? "Saving…" : <><Save className="h-3.5 w-3.5" />Save</>}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-8 gap-1.5 shrink-0"
            title="Export note (.md)"
          >
            <SquareArrowRightExit className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Meta row */}
        {isEditMode ? (
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={collectionId}
              onValueChange={(v) => {
                setCollectionId(v);
                scheduleAutoSaveRef.current();
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
                              setSelectedTagIds((prev) => {
                                const next = checked
                                  ? prev.filter((id) => id !== tag.id)
                                  : [...prev, tag.id];
                                scheduleAutoSaveRef.current();
                                return next;
                              });
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

        {/* Timestamps row */}
        {(createdAt || updatedAt) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {createdAt && <span>Created: {formatDate(createdAt)}</span>}
            {updatedAt && <span>Updated: {formatDate(updatedAt)}</span>}
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
