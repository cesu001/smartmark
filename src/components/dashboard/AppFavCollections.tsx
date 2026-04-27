import { Plus } from "lucide-react";
import AppColCard from "./AppColCard";
import { getFavCollection } from "@/lib/db/collections";

const AppFavCollections = async ({ userID }: { userID: string }) => {
  const collections = await getFavCollection(userID);
  return (
    <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
      {collections.map((col) => (
        <AppColCard key={col.id} col={col} />
      ))}
    </div>
  );
};

export default AppFavCollections;
