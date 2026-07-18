"use client";

import Link from "next/link";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { getContentPreview } from "@/lib/note-preview";
import { Card, CardContent, CardFooter, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import DeleteNoteDialog from "./DeleteNoteDialog";
import { Note } from "@/types/dashboard";

interface AppNoteCardProps {
  note: Note;
  encodedTitle?: string;
  /**
   * Runs after this card's note is deleted. Server-rendered lists don't need
   * it (`router.refresh()` re-fetches them), but a client-held list such as
   * `LoadMoreNotes` must drop the row from its own state or the deleted card
   * stays on screen.
   */
  onDeleted?: () => void;
}

const AppNoteCard = ({ note, encodedTitle, onDeleted }: AppNoteCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const previewContent = getContentPreview(note.content);
  const hasContent = Boolean(previewContent);

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
        <CardContent className="flex-1 min-h-15 max-h-24 overflow-hidden">
          {hasContent ? (
            // react-markdown v10 takes no className of its own, so the
            // `.note-preview` styles (bold headings, list markers, flattened
            // margins) go on a wrapper — same approach as ChatPanel.
            <div className="note-preview text-sm text-text-secondary">
              <Markdown remarkPlugins={[remarkGfm]}>{previewContent}</Markdown>
            </div>
          ) : (
            <p className="text-sm italic text-text-secondary">Empty content</p>
          )}
        </CardContent>
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
            <span className="text-text-secondary shrink-0">
              {note.updatedAt}
            </span>
          </div>
        </CardFooter>
      </Card>

      <DeleteNoteDialog
        noteId={note.id}
        title={note.title}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onDeleted={onDeleted}
      />
    </>
  );
};

export default AppNoteCard;
