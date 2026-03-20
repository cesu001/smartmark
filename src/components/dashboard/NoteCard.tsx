import { Note, Tag } from "@/types/dashboard";

interface NoteCardProps {
  note: Note;
  tags: Tag[];
}

export default function NoteCard({ note, tags }: NoteCardProps) {
  const noteTags = tags.filter((t) => note.tags.includes(t.id));

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors cursor-pointer">
      <h3 className="text-sm font-medium text-text-primary leading-snug line-clamp-1">
        {note.title}
      </h3>
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 flex-1">
        {note.content}
      </p>
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-wrap gap-1">
          {noteTags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 rounded text-[11px] text-text-secondary bg-surface-hover border border-border"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <span className="text-[11px] text-text-secondary shrink-0">
          {note.updatedAt}
        </span>
      </div>
    </div>
  );
}
