"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface DeleteNoteDialogProps {
  noteId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Runs after a successful delete, before `router.refresh()`. The order
   * matters: NoteDrawer uses this to close the note's tab (a navigation), and
   * refreshing first would let that navigation supersede the pending refresh,
   * leaving sidebar counts stale.
   */
  onDeleted?: () => void;
}

export default function DeleteNoteDialog({
  noteId,
  title,
  open,
  onOpenChange,
  onDeleted,
}: DeleteNoteDialogProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/note/${noteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Note deleted");
      onOpenChange(false);
      onDeleted?.();
      router.refresh();
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
    }
  }

  const displayTitle = title.length > 20 ? title.slice(0, 20) + "…" : title;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="place-items-stretch sm:place-items-stretch text-left">
          <AlertDialogTitle className="text-xl font-bold">
            Delete note?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base font-semibold [text-wrap:unset]">
            &ldquo;{displayTitle}&rdquo; will be permanently deleted. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
          <AlertDialogCancel disabled={deleting} className="w-full mt-0">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
