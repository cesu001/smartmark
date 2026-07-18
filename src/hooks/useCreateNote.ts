"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Creates a blank note and opens it in the workbench in edit mode. Shared by the
 * dashboard "add note" affordances (AddNoteCard, AddNoteTile). The workbench's
 * own "+" button is intentionally not a consumer — it manages tab state and
 * merges the new note into the existing tab list, which this hook doesn't model.
 */
export function useCreateNote() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function createNote() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Note",
          collectionId: null,
          tagIds: [],
          content: "",
        }),
      });
      if (!res.ok) {
        toast.error("Failed to create note");
        return;
      }
      const data: { id: string } = await res.json();
      router.push(
        `/dashboard/workbench?open=${data.id}&title=Untitled+Note&edit=1`,
      );
    } catch {
      toast.error("Failed to create note");
    } finally {
      setCreating(false);
    }
  }

  return { creating, createNote };
}
