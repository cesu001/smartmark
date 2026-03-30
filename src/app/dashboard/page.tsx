import StatsCard from "@/components/dashboard/StatsCard";
import NoteCard from "@/components/dashboard/NoteCard";
import CollectionCard from "@/components/dashboard/CollectionCard";
import { getRecentCollections, getCollectionStats } from "@/lib/db/collections";
import { getNoteStats, getRecentNotes, getPinnedNotes } from "@/lib/db/notes";
import { getAllTags } from "@/lib/db/tags";
import { prisma } from "@/lib/db";

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@smartmark.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export default async function DashboardPage() {
  const userId = await getDemoUserId();

  const [recentCollections, collectionStats] = userId
    ? await Promise.all([
        getRecentCollections(userId, 6),
        getCollectionStats(userId),
      ])
    : [[], { total: 0, favorites: 0 }];
  const [recentNotes, pinnedNotes, noteStats] = userId
    ? await Promise.all([
        getRecentNotes(userId, 6),
        getPinnedNotes(userId, 6),
        getNoteStats(userId),
      ])
    : [[], [], { total: 0, favorites: 0 }];

  const allTags = userId ? await getAllTags(userId) : [];

  return (
    <main className="h-full overflow-y-auto p-6 space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          label="Total Notes"
          value={noteStats.total}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <StatsCard
          label="Collections"
          value={collectionStats.total}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
              />
            </svg>
          }
        />
        <StatsCard
          label="Favorite Notes"
          value={noteStats.favorites}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
        />
        <StatsCard
          label="Favorite Collections"
          value={collectionStats.favorites}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
        />
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            Pinned Notes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-3">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} tags={allTags} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Collections */}
      <section>
        <h2 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            />
          </svg>
          Recent Collections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {recentCollections.map(({ borderColor, ...collection }) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              borderColor={borderColor}
            />
          ))}
        </div>
      </section>

      {/* Recent Notes */}
      <section>
        <h2 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Recent Notes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {recentNotes.map((note) => (
            <NoteCard key={note.id} note={note} tags={allTags} />
          ))}
        </div>
      </section>
    </main>
  );
}
