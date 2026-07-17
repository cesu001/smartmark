import { Card, CardContent, CardFooter, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

function NoteCardSkeleton() {
  return (
    <Card>
      <CardTitle className="px-4 py-2 flex items-center gap-2">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
      </CardTitle>
      <CardContent className="flex-1 min-h-15 max-h-24 overflow-hidden space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/5" />
      </CardContent>
      <CardFooter>
        <div className="w-full flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
}

interface NoteCardGridSkeletonProps {
  count?: number;
}

export default function NoteCardGridSkeleton({
  count = 8,
}: NoteCardGridSkeletonProps) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-1">
      {Array.from({ length: count }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  );
}

export { NoteCardSkeleton };
