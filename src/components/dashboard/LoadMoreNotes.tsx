"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppNoteCard from "./AppNoteCard";
import type { Note } from "@/types/dashboard";

interface NotePageResponse {
  notes: Note[];
  nextCursor: string | null;
}

interface LoadMoreNotesProps {
  /** Which list is paging — must match the API's `scope` values. */
  scope: "all" | "favorites";
  /** Cursor returned alongside the server-rendered first page. */
  initialCursor: string | null;
}

/**
 * Renders the pages fetched after the first one, plus the button that loads
 * them. The first page is server-rendered by the page itself, so this only
 * mounts when there's actually more to fetch.
 *
 * Sits inside the page's grid (no wrapper element) so appended cards flow into
 * the same columns as the server-rendered ones; the button spans a full row.
 */
export default function LoadMoreNotes({
  scope,
  initialCursor,
}: LoadMoreNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/note?scope=${scope}&cursor=${encodeURIComponent(cursor)}`,
      );
      if (!res.ok) throw new Error("Request failed");

      const page: NotePageResponse = await res.json();
      setNotes((prev) => [...prev, ...page.notes]);
      setCursor(page.nextCursor);
    } catch {
      toast.error("Could not load more notes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {notes.map((note) => (
        <AppNoteCard
          key={note.id}
          note={note}
          encodedTitle={encodeURIComponent(note.title)}
          onDeleted={() =>
            setNotes((prev) => prev.filter((n) => n.id !== note.id))
          }
        />
      ))}

      {cursor && (
        <div className="col-span-full flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}
