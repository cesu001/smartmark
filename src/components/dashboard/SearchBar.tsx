"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import SearchResultRow, {
  type SearchResultNote,
} from "./SearchResultRow";
import SearchResultEntityRow, {
  type SearchResultEntity,
} from "./SearchResultEntityRow";

interface SearchResponse {
  titleMatches: SearchResultNote[];
  contentMatches: SearchResultNote[];
  semanticMatches: SearchResultNote[];
  collectionMatches: SearchResultEntity[];
  tagMatches: SearchResultEntity[];
}

type SearchMode = "normal" | "semantic";

// A single item in the keyboard-navigable flat list, tagged with its kind so
// Enter/click can route to the right destination (workbench vs. collection/tag page).
type FlatItem =
  | { kind: "note"; note: SearchResultNote }
  | { kind: "collection" | "tag"; entity: SearchResultEntity };

export default function SearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("normal");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Switching mode invalidates the current result set (the two modes return
  // different sections), so clear results and any error alongside the change.
  function changeMode(next: SearchMode) {
    setMode(next);
    setResults(null);
    setError(null);
  }

  // Explicit search — runs only on Apply (button / Enter), never on keystroke.
  async function runSearch() {
    const q = query.trim();
    if (!q) {
      setResults(null);
      setError(null);
      setLoading(false);
      return;
    }

    setOpen(true);
    setLoading(true);
    const currentId = ++requestId.current;
    try {
      const res = await fetch("/api/dashboard/search/semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, mode }),
      });
      // Ignore stale responses (a newer Apply already fired).
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
  }

  // Reset the keyboard highlight whenever the result set changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // Close the dropdown and reset the searchbar to its empty state — clears the
  // typed query and any results/error, not just the open flag.
  function closeSearch() {
    setOpen(false);
    setQuery("");
    setResults(null);
    setError(null);
    setActiveIndex(-1);
  }

  // Close (and clear) on outside click.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        closeSearch();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function handleSelect(note: SearchResultNote) {
    setOpen(false);
    setQuery("");
    setResults(null);
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
    setResults(null);
    setActiveIndex(-1);
    router.push(`/dashboard/${type}/${entity.id}`);
  }

  const hasQuery = query.trim().length > 0;
  const titleMatches = results?.titleMatches ?? [];
  const contentMatches = results?.contentMatches ?? [];
  const semanticMatches = results?.semanticMatches ?? [];
  const collectionMatches = results?.collectionMatches ?? [];
  const tagMatches = results?.tagMatches ?? [];

  // Flat, keyboard-navigable order matches the section order rendered below and
  // depends on the mode: semantic shows only semantic notes; normal shows
  // title + content notes, then collections, then tags.
  const flatResults: FlatItem[] =
    mode === "semantic"
      ? semanticMatches.map((note): FlatItem => ({ kind: "note", note }))
      : [
          ...titleMatches.map((note): FlatItem => ({ kind: "note", note })),
          ...contentMatches.map((note): FlatItem => ({ kind: "note", note })),
          ...collectionMatches.map(
            (entity): FlatItem => ({ kind: "collection", entity }),
          ),
          ...tagMatches.map((entity): FlatItem => ({ kind: "tag", entity })),
        ];

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      closeSearch();
      return;
    }
    // Enter applies the search unless a result row is highlighted, in which
    // case it selects that row.
    if (e.key === "Enter") {
      const selected = open ? flatResults[activeIndex] : undefined;
      if (selected) {
        e.preventDefault();
        if (selected.kind === "note") {
          handleSelect(selected.note);
        } else {
          handleSelectEntity(selected.entity, selected.kind);
        }
      } else {
        e.preventDefault();
        runSearch();
      }
      return;
    }
    if (!open || flatResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
  }

  const noResults =
    !loading &&
    !error &&
    results !== null &&
    flatResults.length === 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="flex items-center gap-2">
        {/* Mode toggle — left of the searchbar, with the switch centered
            between the "Normal" and "Semantic" labels. */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => changeMode("normal")}
            className={cn(
              "cursor-pointer text-xs whitespace-nowrap transition-colors",
              mode === "normal"
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            Normal
          </button>
          <Switch
            id="search-mode"
            checked={mode === "semantic"}
            onCheckedChange={(checked) =>
              changeMode(checked ? "semantic" : "normal")
            }
          />
          <button
            type="button"
            onClick={() => changeMode("semantic")}
            className={cn(
              "cursor-pointer text-xs whitespace-nowrap transition-colors",
              mode === "semantic"
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            Semantic
          </button>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "semantic"
                ? "Search notes by meaning…"
                : "Search notes, collections, tags…"
            }
            className="pl-9 pr-9 h-9"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          )}

          {/* Anchored to this input wrapper (not the whole row) so the dropdown
              width matches the searchbar, not the toggle + button. */}
          {open && results !== null && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-96 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
              {error && (
                <p className="px-3 py-3 text-xs text-muted-foreground">{error}</p>
              )}

              {!error && noResults && (
                <p className="px-3 py-3 text-xs text-muted-foreground text-center">
                  No results found
                </p>
              )}

              {!error && !noResults && mode === "semantic" && (
                <section>
                  <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Semantic Matches
                  </p>
                  {semanticMatches.map((n, i) => (
                    <SearchResultRow
                      key={n.id}
                      note={n}
                      active={activeIndex === i}
                      onSelect={handleSelect}
                    />
                  ))}
                </section>
              )}

              {!error && !noResults && mode === "normal" && (
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
                        No title matches
                      </p>
                    )}
                  </section>

                  <div className="border-t border-border" />

                  <section>
                    <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Content Matches
                    </p>
                    {contentMatches.length > 0 ? (
                      contentMatches.map((n, i) => (
                        <SearchResultRow
                          key={n.id}
                          note={n}
                          active={activeIndex === titleMatches.length + i}
                          onSelect={handleSelect}
                        />
                      ))
                    ) : (
                      <p className="px-3 pb-2 text-xs text-muted-foreground/70 italic">
                        No content matches
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
                            titleMatches.length + contentMatches.length + i
                          }
                          onSelect={handleSelectEntity}
                        />
                      ))
                    ) : (
                      <p className="px-3 pb-2 text-xs text-muted-foreground/70 italic">
                        No collection matches
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
                              contentMatches.length +
                              collectionMatches.length +
                              i
                          }
                          onSelect={handleSelectEntity}
                        />
                      ))
                    ) : (
                      <p className="px-3 pb-2 text-xs text-muted-foreground/70 italic">
                        No tag matches
                      </p>
                    )}
                  </section>
                </>
              )}
            </div>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          className="h-9 shrink-0"
          onClick={runSearch}
          disabled={!hasQuery || loading}
        >
          Search
        </Button>
      </div>
    </div>
  );
}
