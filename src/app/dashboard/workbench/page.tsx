"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, LayoutDashboard, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

interface Tab {
  id: string;
  title: string;
}

function WorkbenchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.push(
        `/dashboard/workbench?open=${activeTabId}&title=${currentTitle}&tabs=${newTabsParam}`,
      );
    }
  }, [activeTabId, currentTitle, tabsParam, router]);
  return (
    <div className="w-full flex flex-col bg-background">
      <div className="flex items-center gap-2 bg-muted/40 border-b px-4 py-2 rounded-t-xl select-none overflow-x-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="h-8 px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
        </Button>
        {tabs.length > 0 && (
          <Tabs>
            <TabsList>
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`h-8 px-3 text-xs lg:text-sm gap-2 rounded-md transition-all border data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-sm
                      ${isActive ? "text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                  >
                    <FileText className="h-3 w-3" />
                    <span className="truncate max-w-30">{tab.title}</span>
                    <span className="ml-1 p-0.5 rounded-full transition-colors hover:bg-muted text-muted-foreground/60 hover:text-foreground">
                      <X className="h-3 w-3" />
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        )}
      </div>
      <ScrollArea></ScrollArea>
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
