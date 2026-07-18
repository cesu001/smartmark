"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Folder, Tag } from "lucide-react";
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
}

interface Props {
  type: "collection" | "tag";
  id: string;
  name: string;
  noteCount: number;
  isFavorite?: boolean;
}

export default function SidebarHoverMenuItem({
  type,
  id,
  name,
  noteCount,
  isFavorite,
}: Props) {
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against firing a second request while one is already in flight
  // (mouseenter can fire in quick succession). NOT a result cache — we
  // deliberately refetch on every hover so the list reflects current
  // membership, since router.refresh() updates the server sidebar's counts
  // but never remounts this client component to clear a cached list.
  const isFetchingRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const href =
    type === "collection"
      ? `/dashboard/collection/${id}`
      : `/dashboard/tag/${id}`;
  const Icon = type === "collection" ? Folder : Tag;

  const fetchNotes = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const endpoint =
      type === "collection"
        ? `/api/dashboard/collection/${id}/notes`
        : `/api/dashboard/tag/${id}/notes`;
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        // Stale-while-revalidate: `notes` keeps showing the previous list
        // until this resolves, so a re-hover doesn't flash "Loading…".
        const data: Note[] = await res.json();
        setNotes(data);
      }
    } catch {
      // silently fail — keep showing whatever was last loaded
    } finally {
      isFetchingRef.current = false;
    }
  };

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const maxPopupHeight = 320;
      const top =
        rect.top + maxPopupHeight > window.innerHeight
          ? Math.max(0, window.innerHeight - maxPopupHeight)
          : rect.top;
      setPopupPos({ top, left: rect.right });
    }
    setIsOpen(true);
    fetchNotes();
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 120);
  };

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleNoteClick = (noteId: string, noteTitle: string) => {
    setIsOpen(false);
    const encodedTitle = encodeURIComponent(noteTitle);
    const isOnWorkbench =
      window.location.pathname === "/dashboard/workbench";

    if (isOnWorkbench) {
      const params = new URLSearchParams(window.location.search);
      const existingTabs = params.get("tabs") || "";
      const tabEntry = `${noteId}_${encodedTitle}`;
      const tabList = existingTabs ? existingTabs.split(",") : [];
      if (!tabList.some((t) => t.startsWith(noteId + "_"))) {
        tabList.push(tabEntry);
      }
      params.set("open", noteId);
      params.set("title", encodedTitle);
      params.set("tabs", tabList.join(","));
      router.push(`/dashboard/workbench?${params.toString()}`);
    } else {
      router.push(
        `/dashboard/workbench?open=${noteId}&title=${encodedTitle}`,
      );
    }
  };

  return (
    <SidebarMenuItem>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarMenuButton asChild>
          <Link href={href}>
            <Icon
              className={cn(isFavorite && "text-primary/30 fill-current")}
            />
            <span className="text-sm text-muted-foreground">{name}</span>
            <SidebarMenuBadge>{noteCount}</SidebarMenuBadge>
          </Link>
        </SidebarMenuButton>
      </div>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: popupPos.top,
            left: popupPos.left,
            zIndex: 50,
          }}
          className="pl-2"
          onMouseEnter={cancelClose}
          onMouseLeave={handleMouseLeave}
        >
          <div
            style={{
              width: "192px",
              maxHeight: isVisible ? "320px" : "0px",
              opacity: isVisible ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 200ms ease-out, opacity 150ms ease-out",
            }}
            className="bg-popover border border-border rounded-b-md shadow-md"
          >
            <div className="py-1">
              {notes === null ? (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  Loading…
                </p>
              ) : notes.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  No notes
                </p>
              ) : (
                notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleNoteClick(note.id, note.title)}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{note.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </SidebarMenuItem>
  );
}
