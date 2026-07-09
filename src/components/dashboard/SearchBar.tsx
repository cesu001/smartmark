"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SearchResultRow, {
  type SearchResultNote,
} from "./SearchResultRow";
import SearchResultEntityRow, {
  type SearchResultEntity,
} from "./SearchResultEntityRow";

interface SearchResponse {
  titleMatches: SearchResultNote[];
  semanticMatches: SearchResultNote[];
  collectionMatches: SearchResultEntity[];
  tagMatches: SearchResultEntity[];
}

// A single item in the keyboard-navigable flat list, tagged with its kind so
// Enter/click can route to the right destination (workbench vs. collection/tag page).
type FlatItem =
  | { kind: "note"; note: SearchResultNote }
  | { kind: "collection" | "tag"; entity: SearchResultEntity };

const DEBOUNCE_MS = 350;

export default function SearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Debounced fetch
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const currentId = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/dashboard/search/semantic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        // Ignore stale responses (a newer keystroke already fired)
        if (currentId !== requestId.current) return;

        if (res.status === 403) {
          setError("Semantic search is a Pro feature.");
          setResults(null);
          return;
        }
        if (res.status === 429) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "Too many searches. Please slow down.");
          setResults(null);
          return;
        }
        if (!res.ok) {
          setError("Search failed. Please try again.");
          setResults(null);
          return;
        }
        const data: SearchResponse = await res.json();
        setError(null);
        setResults(data);
      } catch {
        if (currentId !== requestId.current) return;
        setError("Search failed. Please try again.");
        setResults(null);
      } finally {
        if (currentId === requestId.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset the keyboard highlight whenever the result set changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function handleSelect(note: SearchResultNote) {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    const encodedTitle = encodeURIComponent(note.title);
    const isOnWorkbench = window.location.pathname === "/dashboard/workbench";

    if (isOnWorkbench) {
      const params = new URLSearchParams(window.location.search);
      const existingTabs = params.get("tabs") || "";
      const tabList = existingTabs ? existingTabs.split(",") : [];
      if (!tabList.some((t) => t.startsWith(note.id + "_"))) {
        tabList.push(`${note.id}_${encodedTitle}`);
      }
      params.set("open", note.id);
      params.set("title", encodedTitle);
      params.set("tabs", tabList.join(","));
      router.push(`/dashboard/workbench?${params.toString()}`);
    } else {
      router.push(`/dashboard/workbench?open=${note.id}&title=${encodedTitle}`);
    }
  }

  function handleSelectEntity(
    entity: SearchResultEntity,
    type: "collection" | "tag",
  ) {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    router.push(`/dashboard/${type}/${entity.id}`);
  }

  const hasQuery = query.trim().length > 0;
  const titleMatches = results?.titleMatches ?? [];
  const semanticMatches = results?.semanticMatches ?? [];
  const collectionMatches = results?.collectionMatches ?? [];
  const tagMatches = results?.tagMatches ?? [];
  // Flat, keyboard-navigable order: notes (title, then semantic), then
  // collections, then tags — matches the section order rendered below.
  const flatResults: FlatItem[] = [
    ...titleMatches.map((note): FlatItem => ({ kind: "note", note })),
    ...semanticMatches.map((note): FlatItem => ({ kind: "note", note })),
    ...collectionMatches.map(
      (entity): FlatItem => ({ kind: "collection", entity }),
    ),
    ...tagMatches.map((entity): FlatItem => ({ kind: "tag", entity })),
  ];

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || flatResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const selected = flatResults[activeIndex];
      if (selected) {
        e.preventDefault();
        if (selected.kind === "note") {
          handleSelect(selected.note);
        } else {
          handleSelectEntity(selected.entity, selected.kind);
        }
      }
    }
  }

  const noResults =
    !loading &&
    !error &&
    results !== null &&
    titleMatches.length === 0 &&
    semanticMatches.length === 0 &&
    collectionMatches.length === 0 &&
    tagMatches.length === 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          // Open on type as well as focus — after selecting a result the input
          // keeps focus (rows use onMouseDown), so onFocus alone wouldn't re-fire.
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search notes, collections, tags…"
          className="pl-9 pr-9 h-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && hasQuery && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-96 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
          {error && (
            <p className="px-3 py-3 text-xs text-muted-foreground">{error}</p>
          )}

          {!error && noResults && (
            <p className="px-3 py-3 text-xs text-muted-foreground text-center">
              No results found
            </p>
          )}

          {!error && !noResults && (
            <>
              <section>
                <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Title Matches
                </p>
                {titleMatches.length > 0 ? (
                  titleMatches.map((n, i) => (
                    <SearchResultRow
                      key={n.id}
                      note={n}
                      active={activeIndex === i}
                      onSelect={handleSelect}
                    />
                  ))
                ) : (
                  <p className="px-3 pb-2 text-xs text-muted-foreground/70 italic">
                    {loading ? "Searching…" : "No title matches"}
                  </p>
                )}
              </section>

              <div className="border-t border-border" />

              <section>
                <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Semantic Matches
                </p>
                {semanticMatches.length > 0 ? (
                  semanticMatches.map((n, i) => (
                    <SearchResultRow
                      key={n.id}
                      note={n}
                      active={activeIndex === titleMatches.length + i}
                      onSelect={handleSelect}
                    />
                  ))
                ) : (
                  <p className="px-3 pb-2 text-xs text-muted-foreground/70 italic">
                    {loading ? "Searching…" : "No semantic matches"}
                  </p>
                )}
              </section>

              <div className="border-t border-border" />

              <section>
                <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Collections
                </p>
                {collectionMatches.length > 0 ? (
                  collectionMatches.map((c, i) => (
                    <SearchResultEntityRow
                      key={c.id}
                      entity={c}
                      type="collection"
                      active={
                        activeIndex ===
                        titleMatches.length + semanticMatches.length + i
                      }
                      onSelect={handleSelectEntity}
                    />
                  ))
                ) : (
                  <p className="px-3 pb-2 text-xs text-muted-foreground/70 italic">
                    {loading ? "Searching…" : "No collection matches"}
                  </p>
                )}
              </section>

              <div className="border-t border-border" />

              <section>
                <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Tags
                </p>
                {tagMatches.length > 0 ? (
                  tagMatches.map((t, i) => (
                    <SearchResultEntityRow
                      key={t.id}
                      entity={t}
                      type="tag"
                      active={
                        activeIndex ===
                        titleMatches.length +
                          semanticMatches.length +
                          collectionMatches.length +
                          i
                      }
                      onSelect={handleSelectEntity}
                    />
                  ))
                ) : (
                  <p className="px-3 pb-2 text-xs text-muted-foreground/70 italic">
                    {loading ? "Searching…" : "No tag matches"}
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
