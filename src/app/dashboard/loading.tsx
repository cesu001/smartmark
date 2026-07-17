import {
  RecentNotesSkeleton,
  PinnedNotesSkeleton,
  FavCollectionsSkeleton,
  RecentCollectionsSkeleton,
  StatListSkeleton,
  TagsSkeleton,
} from "@/components/dashboard/DashboardSkeletons";

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="block mb-4 text-lg font-bold text-muted-foreground">
      {children}
    </span>
  );
}

export default function Loading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      {/* Recent Notes */}
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 flex flex-col">
        <PanelHeading>Recent Notes</PanelHeading>
        <RecentNotesSkeleton />
      </div>

      {/* Pinned Notes */}
      <div className="bg-muted p-4 rounded-lg flex flex-col">
        <PanelHeading>Pinned Notes</PanelHeading>
        <PinnedNotesSkeleton />
      </div>

      {/* Stats */}
      <div className="bg-muted p-4 rounded-lg">
        <PanelHeading>Stats</PanelHeading>
        <StatListSkeleton />
      </div>

      {/* Favorite Collections */}
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 flex flex-col">
        <PanelHeading>Favorite Collections</PanelHeading>
        <FavCollectionsSkeleton />
      </div>

      {/* Recent Collections */}
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 flex flex-col">
        <PanelHeading>Recent Collections</PanelHeading>
        <RecentCollectionsSkeleton />
      </div>

      {/* Tags */}
      <div className="bg-muted p-4 rounded-lg lg:col-span-2 xl:col-span-1 flex flex-col">
        <PanelHeading>Tags</PanelHeading>
        <TagsSkeleton />
      </div>
    </div>
  );
}
