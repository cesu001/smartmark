"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableNameProps {
  name: string | null;
}

export default function EditableName({ name }: EditableNameProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(name ?? "");
  const [value, setValue] = useState(name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("Name updated");
      setDisplayName(value.trim());
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(displayName);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 h-9">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-2xl font-bold h-9"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          disabled={saving}
          className="h-7 w-7 shrink-0"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          disabled={saving}
          className="h-7 w-7 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 h-9">
      <h1 className="text-2xl font-bold truncate leading-none">{displayName || "No name"}</h1>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setEditing(true)}
        className="h-7 w-7 shrink-0 text-muted-foreground"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}
