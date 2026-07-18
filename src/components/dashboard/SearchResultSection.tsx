"use client";

import type { ReactNode } from "react";

interface SearchResultSectionProps<T> {
  label: string;
  items: T[];
  /** Copy shown when this section matched nothing. Omit to render nothing when empty. */
  emptyText?: string;
  /**
   * Index of this section's first item within the flat keyboard-navigable list,
   * so `renderItem` can compare against the shared `activeIndex`.
   */
  indexOffset: number;
  renderItem: (item: T, flatIndex: number) => ReactNode;
}

/**
 * One labelled group of results in the search dropdown. The four normal-mode
 * groups (titles, contents, collections, tags) and the semantic-mode group all
 * share this shell — they differ only in their data, empty copy, and where they
 * start in the flat index used for keyboard navigation.
 */
export default function SearchResultSection<T>({
  label,
  items,
  emptyText,
  indexOffset,
  renderItem,
}: SearchResultSectionProps<T>) {
  return (
    <section>
      <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {items.length > 0
        ? items.map((item, i) => renderItem(item, indexOffset + i))
        : emptyText && (
            <p className="px-3 pb-2 text-xs text-muted-foreground/70 italic">
              {emptyText}
            </p>
          )}
    </section>
  );
}
