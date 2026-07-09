import { getRecentCollection } from "@/lib/db/collections";
import AppColCard from "./AppColCard";
import AddCollectionTile from "./AddCollectionTile";

const AppRecentCollections = async ({ userId }: { userId: string }) => {
  const collections = await getRecentCollection(userId, 3);
  if (collections.length === 0) {
    return <AddCollectionTile variant="empty" />;
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <AddCollectionTile variant="compact" />
      {collections.map((col) => (
        <AppColCard key={col.id} col={col} />
      ))}
    </div>
  );
};

export default AppRecentCollections;
