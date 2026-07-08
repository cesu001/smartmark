"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  type: "collection" | "tag";
  initialFavorite: boolean;
}

export default function EntityFavoriteToggle({
  id,
  type,
  initialFavorite,
}: Props) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [saving, setSaving] = useState(false);
  const Icon = type === "collection" ? Folder : Tag;

  async function handleToggle() {
    const next = !isFavorite;
    setIsFavorite(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });
      if (!res.ok) throw new Error("Failed to update favorite");
      toast.success(next ? "Added to favorites" : "Removed from favorites");
      router.refresh();
    } catch {
      setIsFavorite(!next);
      toast.error("Failed to update favorite");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={saving}
      className={cn(
        "h-7 w-7 shrink-0",
        isFavorite ? "text-primary/30" : "text-muted-foreground",
      )}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Icon className={cn("w-5 h-5", isFavorite && "fill-current")} />
    </Button>
  );
}
