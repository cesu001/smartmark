"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContent } from "@tiptap/react";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  Import,
  Loader2,
  Pencil,
  Pin,
  Save,
  Sparkles,
  SquareArrowRightExit,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DeleteNoteDialog from "./DeleteNoteDialog";
import NoteMetaBar from "./NoteMetaBar";
import { validateImportFile, deriveTitleFromFilename } from "@/lib/note-import";
import { buildExportContent, buildExportFilename } from "@/lib/note-export";
import { cn } from "@/lib/utils";
import { useAutoSaveNote } from "@/hooks/useAutoSaveNote";

interface NoteDrawerProps {
  noteId: string;
  startInEditMode?: boolean;
  onEditModeChange?: (isEditMode: boolean) => void;
  onTitleSaved?: (title: string) => void;
  onDeleted?: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function NoteDrawer({
  noteId,
  startInEditMode,
  onEditModeChange,
  onTitleSaved,
  onDeleted,
}: NoteDrawerProps) {
  const router = useRouter();
  const {
    editor,
    isEditMode,
    setIsEditMode,
    title,
    setTitle,
    collectionId,
    setCollectionId,
    selectedTagIds,
    setSelectedTagIds,
    collections,
    tags,
    isSubmitting,
    createdAt,
    updatedAt,
    saveStatus,
    isPinned,
    setIsPinned,
    isFavorite,
    setIsFavorite,
    isNoteLoading,
    scheduleAutoSave,
    handleSubmit,
    refreshCollections,
    refreshTags,
  } = useAutoSaveNote({
    noteId,
    startInEditMode,
    onEditModeChange,
    onTitleSaved,
  });

  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryPopoverOpen, setSummaryPopoverOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Reset the summary popover when switching notes. NoteDrawer is reused (not
  // remounted) across tab switches, so a stale summary from note A must not show
  // over note B. (The note-data reset lives in useAutoSaveNote's load effect.)
  useEffect(() => {
    setSummary(null);
    setSummaryPopoverOpen(false);
    setIsSummarizing(false);
  }, [noteId]);

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
    scheduleAutoSave();
    toast.success("File imported");
  }

  async function handleTogglePinned() {
    const next = !isPinned;
    setIsPinned(next);
    try {
      const res = await fetch(`/api/dashboard/note/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Note pinned" : "Note unpinned");
      router.refresh();
    } catch {
      setIsPinned(!next);
      toast.error("Failed to update note");
    }
  }

  async function handleToggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      const res = await fetch(`/api/dashboard/note/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        next ? "Note added to favorites" : "Note removed from favorites",
      );
      router.refresh();
    } catch {
      setIsFavorite(!next);
      toast.error("Failed to update note");
    }
  }

  async function handleSummarize() {
    setIsSummarizing(true);
    try {
      const res = await fetch(`/api/dashboard/note/${noteId}/summary`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to generate summary");
      setSummary(data.summary as string);
      setSummaryPopoverOpen(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate summary",
      );
    } finally {
      setIsSummarizing(false);
    }
  }

  function handleInsertSummary() {
    if (!summary) return;
    editor
      ?.chain()
      .focus()
      .insertContentAt(0, {
        type: "paragraph",
        content: [{ type: "text", text: summary }],
      })
      .run();
    scheduleAutoSave();
    setSummaryPopoverOpen(false);
    toast.success("Summary inserted");
  }

  async function handleCopySummary() {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Summary copied");
    } catch {
      toast.error("Failed to copy summary");
    }
  }

  function handleExport() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = ((editor?.storage as any)?.markdown?.getMarkdown() as string | undefined) ?? "";
    const blob = new Blob([buildExportContent(content)], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildExportFilename(title);
    a.click();
    URL.revokeObjectURL(url);
  }

  const isEmptyNote = editor?.isEmpty ?? true;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b px-4 py-3 space-y-2 bg-background">
          {/* Title + actions row */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleTogglePinned}
                className={cn(
                  isPinned ? "text-primary/30" : "text-muted-foreground",
                )}
                title={isPinned ? "Unpin note" : "Pin note"}
              >
                <Pin className={cn("h-4 w-4", isPinned && "fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleToggleFavorite}
                className={cn(
                  isFavorite ? "text-primary/30" : "text-muted-foreground",
                )}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  className={cn("h-4 w-4", isFavorite && "fill-current")}
                />
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              {isNoteLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : isEditMode ? (
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    scheduleAutoSave();
                  }}
                  placeholder="Note title"
                  className="text-base font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                />
              ) : (
                <h2 className="text-base font-semibold truncate">{title}</h2>
              )}
            </div>
            {saveStatus === "saving" && (
              <span className="text-xs text-muted-foreground shrink-0">
                Saving…
              </span>
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
                {isSubmitting || saveStatus === "saving" ? (
                  "Saving…"
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </>
                )}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="h-8 gap-1.5 shrink-0"
              title="Delete note"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Popover
              open={summaryPopoverOpen}
              onOpenChange={setSummaryPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="h-8 gap-1.5 shrink-0"
                  title="Summarize note (AI)"
                >
                  {isSummarizing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 space-y-3" align="end">
                <p className="text-sm">{summary}</p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySummary}
                    className="gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleInsertSummary}
                    className="gap-1.5"
                  >
                    Insert
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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
          <NoteMetaBar
            isEditMode={isEditMode}
            collections={collections}
            tags={tags}
            collectionId={collectionId}
            selectedTagIds={selectedTagIds}
            tagPopoverOpen={tagPopoverOpen}
            onTagPopoverOpenChange={(open) => {
              if (open) refreshTags();
              setTagPopoverOpen(open);
            }}
            onCollectionOpenChange={refreshCollections}
            onCollectionChange={(v) => {
              setCollectionId(v);
              scheduleAutoSave();
            }}
            onToggleTag={(tagId) => {
              setSelectedTagIds((prev) => {
                const next = prev.includes(tagId)
                  ? prev.filter((id) => id !== tagId)
                  : [...prev, tagId];
                scheduleAutoSave();
                return next;
              });
            }}
          />

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
          {isNoteLoading && (
            <div className="px-6 py-4 space-y-3" aria-hidden>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-11/12" />
            </div>
          )}
          <div className={cn(isNoteLoading && "hidden")}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <DeleteNoteDialog
        noteId={noteId}
        title={title}
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onDeleted={onDeleted}
      />
    </>
  );
}
