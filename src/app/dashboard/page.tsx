import { Suspense } from "react";
import AppStatList from "@/components/dashboard/AppStatList";
import AppRecentNotes from "@/components/dashboard/AppRecentNotes";
import AppPinnedNotes from "@/components/dashboard/AppPinnedNotes";
import AppRecentCollections from "@/components/dashboard/AppRecentCollections";
import AppFavCollections from "@/components/dashboard/AppFavCollections";
import { requireUserId } from "@/lib/auth-utils";
import AppDashboardTags from "@/components/dashboard/AppDashboardTags";
import {
  RecentNotesSkeleton,
  PinnedNotesSkeleton,
  FavCollectionsSkeleton,
  RecentCollectionsSkeleton,
  StatListSkeleton,
  TagsSkeleton,
} from "@/components/dashboard/DashboardSkeletons";

export const metadata = {
  title: "Dashboard",
  description: "Your personal dashboard to manage your notes and collections.",
};

export default async function Page() {
  const userId = await requireUserId();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 flex flex-col">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Recent Notes
        </span>
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<RecentNotesSkeleton />}>
            <AppRecentNotes userId={userId} />
          </Suspense>
        </div>
      </div>
      <div className="bg-muted p-4 rounded-lg flex flex-col">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Pinned Notes
        </span>
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<PinnedNotesSkeleton />}>
            <AppPinnedNotes userId={userId} />
          </Suspense>
        </div>
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Stats
        </span>
        <Suspense fallback={<StatListSkeleton />}>
          <AppStatList userId={userId} />
        </Suspense>
      </div>
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 flex flex-col">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Favorite Collections
        </span>
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<FavCollectionsSkeleton />}>
            <AppFavCollections userId={userId} />
          </Suspense>
        </div>
      </div>
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Recent Collections
        </span>
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<RecentCollectionsSkeleton />}>
            <AppRecentCollections userId={userId} />
          </Suspense>
        </div>
      </div>
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 flex flex-col">
        <span className="block mb-4 text-lg font-bold text-muted-foreground">
          Tags
        </span>
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<TagsSkeleton />}>
            <AppDashboardTags userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
