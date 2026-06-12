"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
import { Note } from "@/types/dashboard";

interface AppNoteCardProps {
  note: Note;
  encodedTitle?: string;
}

const AppNoteCard = ({ note, encodedTitle }: AppNoteCardProps) => {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/note/${note.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Note deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <Card>
        <CardTitle className="px-4 py-2 flex items-center gap-2 font-semibold">
          <Link
            className="truncate flex-1"
            href={`/dashboard/workbench?open=${note.id}&title=${encodedTitle}`}
          >
            {note.title}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onSelect={() => setConfirmOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
        <CardContent className="line-clamp-3">{note.content}</CardContent>
        <CardFooter>
          <div className="w-full flex items-center justify-between gap-2 mt-auto">
            <div className="flex gap-1">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="bg-primary/10 px-2 py-0.5 rounded text-xs"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <span className="text-text-secondary shrink-0">{note.updatedAt}</span>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="place-items-stretch sm:place-items-stretch text-left">
            <AlertDialogTitle className="text-xl font-bold">Delete note?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-semibold [text-wrap:unset]">
              &ldquo;{note.title.length > 20 ? note.title.slice(0, 20) + "…" : note.title}&rdquo; will be permanently deleted. This action cannot be undone.
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
    </>
  );
};

export default AppNoteCard;
