import { Skeleton } from "@/components/ui/skeleton";

// Skeleton tones on the tab bar's muted background need extra contrast,
// same reason as DashboardSkeletons' ON_MUTED.
const ON_MUTED = "bg-muted-foreground/20";

export default function Loading() {
  return (
    <div className="w-full flex flex-col gap-3 bg-background h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-2 bg-muted/40 border-b border-muted-foreground/30 px-4 py-2 select-none">
        <Skeleton className={`h-8 w-9 rounded-md ${ON_MUTED}`} />
        <Skeleton className={`h-8 w-28 rounded-md ${ON_MUTED}`} />
        <Skeleton className={`h-8 w-8 rounded-md ${ON_MUTED}`} />
      </div>

      {/* Drawer */}
      <div className="flex-1 min-h-0 overflow-hidden border border-muted-foreground/25 rounded-xl p-4 flex flex-col gap-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
        <div className="flex flex-col gap-3 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
