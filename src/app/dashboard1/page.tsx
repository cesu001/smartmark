import { prisma } from "@/lib/db";
import { getAllTags } from "@/lib/db/tags";
import AppStatList from "@/components/dashboard/AppStatList";
import AppRecentNotes from "@/components/dashboard/AppRecentNotes";
import AppPinnedNotes from "@/components/dashboard/AppPinnedNotes";
import AppRecentCollections from "@/components/dashboard/AppRecentCollections";
import AppFavCollections from "@/components/dashboard/AppFavCollections";

export default async function Page() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@smartmark.io" },
    select: { id: true },
  });
  const userId = user?.id;
  if (!userId) return <div>Please Login</div>;
  const tags = await getAllTags(userId);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Recent Notes
        </span>
        <AppRecentNotes userId={userId} tags={tags} />
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Pinned Notes
        </span>
        <AppPinnedNotes userId={userId} tags={tags} />
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Stats
        </span>
        <AppStatList userId={userId} />
      </div>
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Favorite Collections
        </span>
        <AppFavCollections userID={userId} />
      </div>
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Recent Collections
        </span>
        <AppRecentCollections userId={userId} />
      </div>
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Tags
        </span>
        {tags.length === 0 ? (
          <div className="text-sm text-muted-foreground">No tags yet</div>
        ) : (
          <div className="flex flex-wrap space-x-4">
            {tags.slice(0, 8).map((tag) => (
              <div
                key={tag.id}
                className="text-sm bg-primary/10 px-2 py-1 my-2 rounded-xl"
              >
                <span>{tag.name}</span>
                <span className="ml-1 text-muted-foreground">
                  {tag.noteCount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
