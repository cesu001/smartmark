"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function AddNoteCard() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleClick() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Note",
          collectionId: null,
          tagIds: [],
          content: "",
        }),
      });
      if (!res.ok) {
        toast.error("Failed to create note");
        return;
      }
      const data: { id: string } = await res.json();
      router.push(
        `/dashboard/workbench?open=${data.id}&title=Untitled+Note&edit=1`,
      );
    } catch {
      toast.error("Failed to create note");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      onClick={handleClick}
      className="flex flex-col items-center justify-center min-h-48 h-full py-8 border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 group hover:border-muted-foreground/40 transition-colors cursor-pointer"
    >
      <div className="p-3 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
        <Plus className="w-8 h-8 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium text-muted-foreground italic">
        Add new note...
      </span>
    </div>
  );
}
