"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Import, LayoutDashboard, Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import NoteDrawer from "@/components/dashboard/NoteDrawer";
import { validateImportFile, deriveTitleFromFilename } from "@/lib/note-import";

interface Tab {
  id: string;
  title: string;
}

function WorkbenchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  // Tracks which note tabs are currently in edit mode so the state survives tab switches
  const editModeNoteIds = useRef<Set<string>>(new Set());

  // 從 URL 參數中獲取當前活動的 Tab ID、標題和所有 Tab 的資訊
  const activeTabId = searchParams.get("open") || "";
  const currentTitle = searchParams.get("title") || "untitled";
  // 所有分頁
  // tabs 參數格式：tabs=noteId_encodedTitle,noteId_encodedTitle,...
  const tabsParam = searchParams.get("tabs") || "";
  const tabs: Tab[] = tabsParam
    ? tabsParam.split(",").map((tab) => {
        const [id, title] = tab.split("_");
        return { id, title: decodeURIComponent(title || "untitled") };
      })
    : [];
  // 將tabs陣列轉回URL參數格式
  const serializedTabs = (tabsList: Tab[]) => {
    return tabsList
      .map((tab) => `${tab.id}_${encodeURIComponent(tab.title)}`)
      .join(",");
  };
  // 將新的open id 和 title 加入到 tabs 中，並更新 URL 參數
  useEffect(() => {
    if (activeTabId && !tabs.some((tab) => tab.id === activeTabId)) {
      const updatedTabs = [...tabs, { id: activeTabId, title: currentTitle }];
      const newTabsParam = serializedTabs(updatedTabs);
      router.replace(
        `/dashboard/workbench?open=${activeTabId}&title=${currentTitle}&tabs=${newTabsParam}`,
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId, currentTitle, tabsParam, router]);

  async function handleNewNote() {
    setIsCreatingNote(true);
    try {
      const res = await fetch("/api/dashboard/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Note", collectionId: null, tagIds: [], content: "" }),
      });
      if (!res.ok) {
        toast.error("Failed to create note");
        return;
      }
      const data: { id: string } = await res.json();
      editModeNoteIds.current.add(data.id);
      const newTabs = [...tabs, { id: data.id, title: "Untitled Note" }];
      router.push(
        `/dashboard/workbench?open=${data.id}&title=Untitled+Note&tabs=${serializedTabs(newTabs)}`,
      );
    } catch {
      toast.error("Failed to create note");
    } finally {
      setIsCreatingNote(false);
    }
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  async function handleImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validation = validateImportFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsImporting(true);
    try {
      const content = await file.text();
      const title = deriveTitleFromFilename(file.name);
      const res = await fetch("/api/dashboard/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, collectionId: null, tagIds: [], content }),
      });
      if (!res.ok) {
        toast.error("Failed to import note");
        return;
      }
      const data: { id: string } = await res.json();
      const newTabs = [...tabs, { id: data.id, title }];
      router.push(
        `/dashboard/workbench?open=${data.id}&title=${encodeURIComponent(title)}&tabs=${serializedTabs(newTabs)}`,
      );
      toast.success("Note imported");
    } catch {
      toast.error("Failed to import note");
    } finally {
      setIsImporting(false);
    }
  }

  function handleCloseTab(tabId: string) {
    editModeNoteIds.current.delete(tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    let newOpen = activeTabId === tabId ? "" : activeTabId;
    if (activeTabId === tabId && newTabs.length > 0) {
      newOpen = newTabs[newTabs.length - 1].id;
    }
    const params = new URLSearchParams();
    if (newOpen) {
      const openTab = newTabs.find((t) => t.id === newOpen);
      params.set("open", newOpen);
      if (openTab) params.set("title", openTab.title);
    }
    if (newTabs.length > 0) {
      params.set("tabs", serializedTabs(newTabs));
    }
    const qs = params.toString();
    router.push(`/dashboard/workbench${qs ? "?" + qs : ""}`);
  }

  function handleTitleSaved(newTitle: string) {
    if (!activeTabId) return;
    const currentTab = tabs.find((t) => t.id === activeTabId);
    if (!currentTab || currentTab.title === newTitle) return;
    const newTabs = tabs.map((t) => (t.id === activeTabId ? { ...t, title: newTitle } : t));
    router.replace(
      `/dashboard/workbench?open=${activeTabId}&title=${encodeURIComponent(newTitle)}&tabs=${serializedTabs(newTabs)}`,
    );
  }

  function handleSwitchTab(tab: Tab) {
    router.push(
      `/dashboard/workbench?open=${tab.id}&title=${encodeURIComponent(tab.title)}&tabs=${tabsParam}`,
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 bg-background h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-2 bg-muted/40 border-b border-muted-foreground/30 px-4 py-2 select-none overflow-x-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="h-8 px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
        </Button>
        {tabs.length > 0 && (
          <Tabs value={activeTabId}>
            <TabsList className="gap-2 bg-transparent p-0">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    onClick={() => handleSwitchTab(tab)}
                    className={`h-8 px-3 text-xs lg:text-sm gap-2 rounded-md transition-all border data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-sm
                      ${isActive ? "text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                  >
                    <FileText className="h-3 w-3" />
                    <span className="truncate max-w-30">{tab.title}</span>
                    <span
                      className="ml-1 p-0.5 rounded-full transition-colors hover:bg-muted text-muted-foreground/60 hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(tab.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewNote}
          disabled={isCreatingNote}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          title="New note"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImportClick}
          disabled={isImporting}
          className="h-8 px-1.5 text-muted-foreground hover:text-foreground"
          title="Import note (.md, .txt)"
        >
          <Import className="h-5 w-5" />
        </Button>
        <input
          ref={importInputRef}
          type="file"
          accept=".md,.txt,text/markdown,text/plain"
          className="hidden"
          onChange={handleImportFileChange}
        />
      </div>

      {/* Drawer */}
      <div className="flex-1 min-h-0 overflow-hidden border border-muted-foreground/25 rounded-xl">
        {activeTabId ? (
          <NoteDrawer
            noteId={activeTabId}
            startInEditMode={editModeNoteIds.current.has(activeTabId)}
            onEditModeChange={(isEdit) => {
              if (isEdit) editModeNoteIds.current.add(activeTabId);
              else editModeNoteIds.current.delete(activeTabId);
            }}
            onTitleSaved={handleTitleSaved}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Open a note or click + to create one
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <WorkbenchContent />
    </Suspense>
  );
}
