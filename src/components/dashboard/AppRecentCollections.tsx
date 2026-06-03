import { getRecentCollection } from "@/lib/db/collections";
import { Plus } from "lucide-react";
import AppColCard from "./AppColCard";

const AppRecentCollections = async ({ userId }: { userId: string }) => {
  const collections = await getRecentCollection(userId, 3);
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-48 h-full py-8 border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 group hover:border-muted-foreground/40 transition-colors cursor-pointer">
        <div className="p-3 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-muted-foreground italic">
          Add new collection...
        </span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-muted flex justify-center items-center border border-muted-foreground/20 rounded-xl transition-transform duration-200 hover:scale-105 cursor-pointer">
        <Plus className="w-12 h-12 text-muted-foreground" />
      </div>
      {collections.map((col) => (
        <AppColCard key={col.id} col={col} />
      ))}
    </div>
  );
};

export default AppRecentCollections;
