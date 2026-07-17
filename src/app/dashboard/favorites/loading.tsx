import { NoteCardSkeleton } from "@/components/dashboard/NoteCardGridSkeleton";
import { ColCardSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 w-full px-px pb-4">
      {/* Favorite Notes */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Favorite Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Favorite Collections */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Favorite Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ColCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Favorite Tags */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Favorite Tags</h2>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
