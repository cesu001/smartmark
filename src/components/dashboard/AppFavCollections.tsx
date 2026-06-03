import AppColCard from "./AppColCard";
import { getFavCollection } from "@/lib/db/collections";

const AppFavCollections = async ({ userId }: { userId: string }) => {
  const collections = await getFavCollection(userId);
  return (
    <div className="h-full flex flex-col gap-3">
      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 h-full">
          <span className="text-sm font-medium text-muted-foreground/80 italic">
            No favorite collections yet
          </span>
        </div>
      ) : (
        collections.map((col) => <AppColCard key={col.id} col={col} />)
      )}
    </div>
  );
};

export default AppFavCollections;
