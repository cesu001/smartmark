import { Tag } from "@/types/dashboard";

const AppTagCard = ({
  id,
  name,
  noteCount,
}: {
  id: string;
  name: string;
  noteCount: number;
}) => {
  return (
    <div className="text-sm bg-primary/10 px-2 py-1 my-2 rounded-xl flex items-center">
      <span>{name}</span>
      <span className="ml-1 text-muted-foreground">{noteCount}</span>
    </div>
  );
};

export default AppTagCard;
