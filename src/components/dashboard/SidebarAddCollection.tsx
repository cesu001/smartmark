"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SidebarAddCollection() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setName("");
        setOpen(false);
        router.refresh();
        toast.success("Collection created");
      } else {
        toast.error("Failed to create collection");
      }
    } catch {
      toast.error("Failed to create collection");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setName("");
    setOpen(false);
  }

  if (open) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1 pl-2 pr-1 py-1"
      >
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection Name"
          className="h-7 text-xs"
          onKeyDown={(e) => e.key === "Escape" && handleCancel()}
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="h-5 w-5 shrink-0 text-green-500 hover:text-green-600"
          disabled={loading || !name.trim()}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-5 w-5 shrink-0"
          onClick={handleCancel}
          disabled={loading}
        >
          <X className="h-3 w-3" />
        </Button>
      </form>
    );
  }

  return (
    <SidebarMenuButton
      onClick={() => setOpen(true)}
      className="justify-center transition-all duration-300 ease-in-out hover:text-green-400 hover:scale-105"
    >
      <Plus className="w-6 h-6" />
    </SidebarMenuButton>
  );
}
