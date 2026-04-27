import { Folder, Star } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface ColProps {
  id: string;
  name: string;
  updatedAt: Date;
  _count: {
    notes: number;
  };
  isFavorite: boolean;
}

const AppColCard = ({ col }: { col: ColProps }) => {
  return (
    <Card>
      <CardContent className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Folder />
          <div className="flex flex-col">
            <span className="font-semibold truncate">{col.name}</span>
            <span>{col._count.notes} notes</span>
          </div>
        </div>
        {col.isFavorite && <Star className="text-green-400" size={20} />}
      </CardContent>
    </Card>
  );
};

export default AppColCard;
