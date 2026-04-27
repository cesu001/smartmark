import { getRecentCollection } from "@/lib/db/collections";
import { Plus } from "lucide-react";
import AppColCard from "./AppColCard";

const AppRecentCollections = async ({ userId }: { userId: string }) => {
  const collections = await getRecentCollection(userId, 3);
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
