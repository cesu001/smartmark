"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { toast } from "sonner";

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
  isPinned: boolean;
  isFavorite: boolean;
  tags: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

type SaveStatus = "idle" | "saving" | "saved";

interface UseAutoSaveNoteOptions {
  noteId: string;
  startInEditMode?: boolean;
  onEditModeChange?: (isEditMode: boolean) => void;
  onTitleSaved?: (title: string) => void;
}

/**
 * Owns a note's editable state, its Tiptap editor, and the debounced autosave
 * machinery for the workbench NoteDrawer. Extracted from NoteDrawer so the
 * component is left with rendering + one-off note actions (pin/favorite/delete/
 * summarize/import/export). Behaviour is intentionally identical to the previous
 * inline implementation — including the silent flush-on-leave, the stale-fetch
 * guard, and the "only refresh the sidebar when collection/tags changed" rule.
 */
export function useAutoSaveNote({
  noteId,
  startInEditMode,
  onEditModeChange,
  onTitleSaved,
}: UseAutoSaveNoteOptions) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(startInEditMode ?? false);
  const [title, setTitle] = useState("Untitled Note");
  const [collectionId, setCollectionId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<SimpleCollection[]>([]);
  const [tags, setTags] = useState<SimpleTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(true);

  const isLoaded = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always-current save function — avoids stale closures inside setTimeout.
  // `silent` persists without touching UI state (used when flushing on leave,
  // where this component instance is about to display a different note).
  const doAutoSaveRef = useRef<(silent?: boolean) => Promise<boolean>>(
    async () => false,
  );
  // Stable ref so the editor's onUpdate (captured once at creation) always calls the latest scheduler
  const scheduleAutoSaveRef = useRef<() => void>(() => {});
  // Tracks last-persisted collection/tags so autosave only refreshes the sidebar when they actually change
  const lastMetaRef = useRef<{ collectionId: string; tagIds: string }>({
    collectionId: "",
    tagIds: "",
  });

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
        // emitUpdate:false — this is a programmatic load, not a user edit, so it
        // must not schedule an autosave (Tiptap v3 emits updates by default).
        editor.commands.setContent(pendingContent.current, {
          emitUpdate: false,
        });
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
    autoSaveTimerRef.current = setTimeout(() => {
      // Null the ref once the debounce fires so it accurately reflects "a save
      // is still pending" — the cleanup flush relies on this to avoid redundant
      // writes after a save has already gone out.
      autoSaveTimerRef.current = null;
      doAutoSaveRef.current();
    }, 1000);
  };

  // Stable wrapper callers can pass around without re-subscribing every render.
  const scheduleAutoSave = useCallback(() => scheduleAutoSaveRef.current(), []);

  // Sync edit mode → editor editable state
  useEffect(() => {
    editor?.setEditable(isEditMode);
  }, [editor, isEditMode]);

  const setEditorContent = useCallback(
    (content: string) => {
      if (editor) {
        // emitUpdate:false — programmatic load, must not schedule an autosave.
        editor.commands.setContent(content, { emitUpdate: false });
      } else {
        pendingContent.current = content;
      }
    },
    [editor],
  );

  // Load note data (plus the user's collections + tags) when noteId changes
  useEffect(() => {
    // Guards against a stale fetch: if the user switches notes before this
    // request resolves, the cleanup sets `ignore` so the late response can't
    // overwrite the newer note's state.
    let ignore = false;
    isLoaded.current = false;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setIsEditMode(startInEditMode ?? false);
    setTitle("Untitled Note");
    setCollectionId("");
    setSelectedTagIds([]);
    setCreatedAt(null);
    setUpdatedAt(null);
    setSaveStatus("idle");
    setIsPinned(false);
    setIsFavorite(false);
    setEditorContent("");
    setIsNoteLoading(true);

    async function loadNote() {
      const res = await fetch(`/api/dashboard/note/${noteId}`);
      if (ignore) return;
      if (!res.ok) {
        toast.error("Failed to load note");
        setIsNoteLoading(false);
        return;
      }
      const {
        note,
        collections,
        tags,
      }: {
        note: NoteData;
        collections: SimpleCollection[];
        tags: SimpleTag[];
      } = await res.json();
      if (ignore) return;
      setCollections(collections);
      setTags(tags);
      setTitle(note.title);
      setCollectionId(note.collectionId ?? "");
      setSelectedTagIds(note.tags.map((t) => t.id));
      setCreatedAt(note.createdAt);
      setUpdatedAt(note.updatedAt);
      setIsPinned(note.isPinned);
      setIsFavorite(note.isFavorite);
      setEditorContent(note.content ?? "");
      lastMetaRef.current = {
        collectionId: note.collectionId ?? "",
        tagIds: [...note.tags.map((t) => t.id)].sort().join(","),
      };
      isLoaded.current = true;
      setIsNoteLoading(false);
    }
    loadNote();

    return () => {
      ignore = true;
      if (autoSaveTimerRef.current) {
        // A debounced autosave was still pending when the user closed/switched
        // this note. Flush it (silently) instead of dropping it, so edits made
        // within the last second before leaving aren't lost.
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
        doAutoSaveRef.current(true);
      }
      if (savedDisplayTimerRef.current)
        clearTimeout(savedDisplayTimerRef.current);
    };
    // startInEditMode intentionally omitted: only consumed on noteId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, setEditorContent]);

  // Keep doAutoSaveRef current whenever relevant state changes
  useEffect(() => {
    doAutoSaveRef.current = async (silent = false) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = ((editor?.storage as any)?.markdown?.getMarkdown() as string | undefined) ?? "";
      if (!silent) setSaveStatus("saving");
      try {
        const res = await fetch(`/api/dashboard/note/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            collectionId: collectionId || null,
            tagIds: selectedTagIds,
            content,
          }),
        });
        if (!res.ok) throw new Error();
        const data: { id: string; collectionId: string | null } =
          await res.json();
        // The UI updates below would land on whatever note is now displayed, so
        // skip them when flushing on leave — only the DB write and the sidebar
        // refresh (which are note-agnostic) should run in that case.
        if (!silent) {
          setUpdatedAt(new Date().toISOString());
          setSaveStatus("saved");
          if (savedDisplayTimerRef.current)
            clearTimeout(savedDisplayTimerRef.current);
          savedDisplayTimerRef.current = setTimeout(
            () => setSaveStatus("idle"),
            2000,
          );
          onTitleSaved?.(title);
        }

        // Only refresh the sidebar (collection/tag counts) when the note's collection or tags actually changed.
        // Normalize null → "" so an uncategorized note (collectionId null) doesn't read as a change vs. the
        // load-time baseline (which also uses "" for no collection).
        const nextCollectionId = data.collectionId ?? "";
        const nextTagIds = [...selectedTagIds].sort().join(",");
        if (
          nextCollectionId !== lastMetaRef.current.collectionId ||
          nextTagIds !== lastMetaRef.current.tagIds
        ) {
          lastMetaRef.current = {
            collectionId: nextCollectionId,
            tagIds: nextTagIds,
          };
          router.refresh();
        }
        return true;
      } catch {
        if (!silent) setSaveStatus("idle");
        return false;
      }
    };
  }, [noteId, title, collectionId, selectedTagIds, editor, onTitleSaved, router]);

  async function handleSubmit() {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setIsSubmitting(true);
    const ok = await doAutoSaveRef.current();
    setIsSubmitting(false);
    if (ok) {
      setIsEditMode(false);
      onEditModeChange?.(false);
    }
  }

  // Refetch the collection/tag lists on demand so items added from the sidebar
  // (which only triggers router.refresh(), not a re-fetch of this client state)
  // show up when the user opens the Collection select or Tags popover.
  const refreshCollections = useCallback(() => {
    fetch("/api/dashboard/collection")
      .then((r) => {
        if (r.ok) r.json().then(setCollections);
      })
      .catch(() => null);
  }, []);
  const refreshTags = useCallback(() => {
    fetch("/api/dashboard/tag")
      .then((r) => {
        if (r.ok) r.json().then(setTags);
      })
      .catch(() => null);
  }, []);

  return {
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
  };
}
