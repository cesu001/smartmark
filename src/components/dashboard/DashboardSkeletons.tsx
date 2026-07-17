import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { NoteCardSkeleton } from "./NoteCardGridSkeleton";

// Stat cards and tag pills sit on `bg-muted` surfaces, so the default
// `bg-muted` Skeleton would be invisible — use a contrasting tone instead.
const ON_MUTED = "bg-muted-foreground/20";

export function ColCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <Skeleton className="h-6 w-6 rounded-md" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentNotesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PinnedNotesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <NoteCardSkeleton />
      <NoteCardSkeleton />
    </div>
  );
}

export function FavCollectionsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <ColCardSkeleton />
      <ColCardSkeleton />
    </div>
  );
}

export function RecentCollectionsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <ColCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-muted">
          <CardContent className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className={`h-4 w-4 rounded ${ON_MUTED}`} />
              <Skeleton className={`h-4 w-28 ${ON_MUTED}`} />
            </div>
            <Skeleton className={`h-5 w-6 ${ON_MUTED}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TagsSkeleton() {
  return (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className={`h-7 w-16 rounded-xl ${ON_MUTED}`} />
      ))}
    </div>
  );
}
