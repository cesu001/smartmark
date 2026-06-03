import { Tag } from "@/types/dashboard";
import AppTagCard from "./AppTagCard";

const AppTags = ({ tags }: { tags: Tag[] }) => {
  return (
    <div className="h-full flex flex-col gap-3">
      {tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 h-full">
          <span className="text-sm font-medium text-muted-foreground/80 italic">
            No tags yet
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap space-x-4">
          {tags.slice(0, 8).map((tag) => (
            <AppTagCard
              id={tag.id}
              name={tag.name}
              noteCount={tag.noteCount}
              key={tag.id}
            ></AppTagCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppTags;
