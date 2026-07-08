import AppNoteCard from "@/components/dashboard/AppNoteCard";
import EntityActionsMenu from "@/components/dashboard/EntityActionsMenu";
import EntityFavoriteToggle from "@/components/dashboard/EntityFavoriteToggle";
import { requireUserId } from "@/lib/auth-utils";
import { getCollectionWithNotes } from "@/lib/db/collections";
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
        <EntityFavoriteToggle
          id={id}
          type="collection"
          initialFavorite={collection.isFavorite}
        />
        <h1 className="text-xl font-semibold">{collection.name}</h1>
        <span className="text-sm text-muted-foreground">
          ({collection.notes.length})
        </span>
        <EntityActionsMenu
          id={id}
          name={collection.name}
          type="collection"
          noteCount={collection.notes.length}
          redirectTo="/dashboard/allnotes"
        />
      </div>
      <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto p-1">
        {collection.notes.length === 0 && (
          <div className="col-span-full flex items-center justify-center min-h-48 border border-dashed border-muted-foreground/20 rounded-xl">
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
