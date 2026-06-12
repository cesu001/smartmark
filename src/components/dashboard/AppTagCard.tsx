import Link from "next/link";

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
    <Link href={`/dashboard/tag/${id}`}>
      <div className="text-sm bg-primary/10 px-2 py-1 my-2 rounded-xl flex items-center cursor-pointer hover:bg-primary/20 transition-colors">
        <span>{name}</span>
        <span className="ml-1 text-muted-foreground">{noteCount}</span>
      </div>
    </Link>
  );
};

export default AppTagCard;
