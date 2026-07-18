"use client";

import { Plus, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInlineCreate } from "@/hooks/useInlineCreate";

interface AddCollectionTileProps {
  variant: "empty" | "compact";
}

export default function AddCollectionTile({ variant }: AddCollectionTileProps) {
  const { open, setOpen, name, setName, loading, inputRef, handleSubmit, handleCancel } =
    useInlineCreate({
      endpoint: "/api/dashboard/collection",
      successMessage: "Collection created",
      errorMessage: "Failed to create collection",
    });

  if (open) {
    const formClassName =
      variant === "empty"
        ? "flex items-center justify-center gap-2 min-h-48 h-full py-8 border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 px-4"
        : "bg-muted flex items-center justify-center gap-2 border border-muted-foreground/20 rounded-xl px-3 py-3";

    return (
      <form onSubmit={handleSubmit} className={formClassName}>
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name"
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === "Escape" && handleCancel()}
          disabled={loading}
        />
        <div className="flex gap-1 shrink-0">
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-green-500 hover:text-green-600"
            disabled={loading || !name.trim()}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }

  if (variant === "empty") {
    return (
      <div
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center min-h-48 h-full py-8 border border-dashed border-muted-foreground/20 rounded-xl bg-background/30 group hover:border-muted-foreground/40 transition-colors cursor-pointer"
      >
        <div className="p-3 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-muted-foreground italic">
          Add new collection...
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => setOpen(true)}
      className="bg-muted flex justify-center items-center border border-muted-foreground/20 rounded-xl transition-transform duration-200 hover:scale-105 cursor-pointer"
    >
      <Plus className="w-12 h-12 text-muted-foreground" />
    </div>
  );
}
