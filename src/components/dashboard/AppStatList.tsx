import { getNoteStats } from "@/lib/db/notes";
import { getCollectionStats } from "@/lib/db/collections";
import { Card, CardContent, CardTitle } from "../ui/card";
import { File, Heart, Star } from "lucide-react";

interface AppStatListProps {
  userId: string;
}

const AppStatList: React.FC<AppStatListProps> = async ({ userId }) => {
  const [noteStats, collectionStats] = await Promise.all([
    getNoteStats(userId),
    getCollectionStats(userId),
  ]);
  return (
    <div className="flex flex-col gap-2">
      <Card className="bg-muted">
        <CardContent className="flex justify-between items-center">
          <div className="flex items-bottom">
            <File className="w-4 h-4" />
            <CardTitle className="ml-2 text-sm">Total Notes</CardTitle>
          </div>
          <span className="text-lg">{noteStats.total}</span>
        </CardContent>
      </Card>
      <Card className="bg-muted">
        <CardContent className="flex justify-between items-center">
          <div className="flex items-bottom">
            <Heart className="w-4 h-4" />
            <CardTitle className="ml-2 text-sm">Favorite Notes</CardTitle>
          </div>
          <span className="text-lg">{noteStats.favorites}</span>
        </CardContent>
      </Card>
      <Card className="bg-muted">
        <CardContent className="flex justify-between items-center">
          <div className="flex items-bottom">
            <File className="w-4 h-4" />
            <CardTitle className="ml-2 text-sm">Total Collections</CardTitle>
          </div>
          <span className="text-lg">{collectionStats.total}</span>
        </CardContent>
      </Card>
      <Card className="bg-muted">
        <CardContent className="flex justify-between items-center">
          <div className="flex items-bottom">
            <Star className="w-4 h-4" />
            <CardTitle className="ml-2 text-sm">Favorite Collections</CardTitle>
          </div>
          <span className="text-lg">{collectionStats.favorites}</span>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppStatList;
