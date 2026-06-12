import AppNoteCard from "@/components/dashboard/AppNoteCard";
import { requireUserId } from "@/lib/auth-utils";
import { getCollectionWithNotes } from "@/lib/db/collections";
import { Folder, Plus } from "lucide-react";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const collection = await getCollectionWithNotes(id, userId);
  if (!collection) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Folder className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{collection.name}</h1>
        <span className="text-sm text-muted-foreground">
          ({collection.notes.length})
        </span>
      </div>
      <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-48 h-full py-8 border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 group hover:border-muted-foreground/40 transition-colors cursor-pointer">
          <div className="p-3 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-muted-foreground italic">
            Add new note...
          </span>
        </div>
        {collection.notes.length === 0 && (
          <div className="md:col-span-1 lg:col-span-3 flex items-center justify-center min-h-48 border border-dashed border-muted-foreground/20 rounded-xl">
            <span className="text-sm text-muted-foreground italic">
              No notes in this collection yet.
            </span>
          </div>
        )}
        {collection.notes.map((note) => {
          const encodedTitle = encodeURIComponent(note.title);
          return (
            <AppNoteCard key={note.id} note={note} encodedTitle={encodedTitle} />
          );
        })}
      </div>
    </div>
  );
}
