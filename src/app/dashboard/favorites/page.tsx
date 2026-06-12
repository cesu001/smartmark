import AppColCard from "@/components/dashboard/AppColCard";
import AppNoteCard from "@/components/dashboard/AppNoteCard";
import AppTagCard from "@/components/dashboard/AppTagCard";
import { requireUserId } from "@/lib/auth-utils";
import { getFavCollection } from "@/lib/db/collections";
import { getFavoriteNotes } from "@/lib/db/notes";
import { getFavoriteTags } from "@/lib/db/tags";

export default async function Page() {
  const userId = await requireUserId();

  const [notes, collections, tags] = await Promise.all([
    getFavoriteNotes(userId),
    getFavCollection(userId, 100),
    getFavoriteTags(userId),
  ]);

  return (
    <div className="flex flex-col gap-8 w-full px-px pb-4">
      {/* Favorite Notes */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Favorite Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {notes.length === 0 ? (
            <div className="flex items-center justify-center min-h-32 border border-dashed border-muted-foreground/20 rounded-xl text-sm text-muted-foreground italic">
              No favorite notes yet
            </div>
          ) : (
            notes.map((note) => (
              <AppNoteCard
                key={note.id}
                note={note}
                encodedTitle={encodeURIComponent(note.title)}
              />
            ))
          )}
        </div>
      </section>

      {/* Favorite Collections */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Favorite Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {collections.length === 0 ? (
            <div className="flex items-center justify-center min-h-32 border border-dashed border-muted-foreground/20 rounded-xl text-sm text-muted-foreground italic">
              No favorite collections yet
            </div>
          ) : (
            collections.map((col) => <AppColCard key={col.id} col={col} />)
          )}
        </div>
      </section>

      {/* Favorite Tags */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Favorite Tags</h2>
        <div className="flex flex-wrap gap-3">
          {tags.length === 0 ? (
            <div className="flex items-center justify-center min-h-32 w-fit min-w-48 border border-dashed border-muted-foreground/20 rounded-xl px-6 text-sm text-muted-foreground italic">
              No favorite tags yet
            </div>
          ) : (
            tags.map((tag) => (
              <AppTagCard
                key={tag.id}
                id={tag.id}
                name={tag.name}
                noteCount={tag.noteCount}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
