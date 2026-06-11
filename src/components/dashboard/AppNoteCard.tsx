import Link from "next/link";
import { Card, CardContent, CardFooter, CardTitle } from "../ui/card";
import { Note } from "@/types/dashboard";

interface AppNoteCardProps {
  note: Note;
  encodedTitle?: string;
}

const AppNoteCard = ({ note, encodedTitle }: AppNoteCardProps) => {
  return (
    <Card>
      <CardTitle className="px-4 py-2 truncate font-semibold">
        <Link
          href={`/dashboard/workbench?open=${note.id}&title=${encodedTitle}`}
        >
          {note.title}
        </Link>
      </CardTitle>
      <CardContent className="line-clamp-3">{note.content}</CardContent>
      <CardFooter>
        <div className="w-full flex items-center justify-between gap-2 mt-auto">
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="bg-primary/10 px-2 py-0.5 rounded text-xs"
              >
                {tag.name}
              </span>
            ))}
          </div>
          <span className="text-text-secondary shrink-0">{note.updatedAt}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AppNoteCard;
