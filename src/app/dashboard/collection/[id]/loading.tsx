import NoteCardGridSkeleton from "@/components/dashboard/NoteCardGridSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-8" />
      </div>
      <NoteCardGridSkeleton />
    </div>
  );
}
