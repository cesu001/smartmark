import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-4 px-px">
      {/* Profile info */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-8">
            <Skeleton className="h-20 w-20 rounded-full shrink-0" />
            <div className="flex flex-col gap-2 min-w-0">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-36 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="px-8 pt-6 pb-0">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="px-8 pb-6 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50"
              >
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-7 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader className="px-8 pt-6 pb-0">
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="px-8 pb-6 pt-4 flex flex-col gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
