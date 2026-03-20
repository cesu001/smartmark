import { Collection } from "@/types/dashboard";

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors cursor-pointer">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-hover shrink-0">
          <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{collection.name}</p>
          <p className="text-xs text-text-secondary">{collection.noteCount} notes</p>
        </div>
      </div>
      {collection.isFavorite && (
        <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
    </div>
  );
}
