"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseInlineCreateOptions {
  /** POST endpoint that creates the entity; receives `{ name }`. */
  endpoint: string;
  successMessage: string;
  errorMessage: string;
}

/**
 * State + submit logic for an inline "create by name" form (Collections/Tags).
 * Owns the open/name/loading state and the POST → refresh → toast flow; the
 * caller supplies the markup. Shared by SidebarInlineAddForm and AddCollectionTile.
 */
export function useInlineCreate({
  endpoint,
  successMessage,
  errorMessage,
}: UseInlineCreateOptions) {
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
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setName("");
        setOpen(false);
        router.refresh();
        toast.success(successMessage);
      } else {
        toast.error(errorMessage);
      }
    } catch {
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setName("");
    setOpen(false);
  }

  return {
    open,
    setOpen,
    name,
    setName,
    loading,
    inputRef,
    handleSubmit,
    handleCancel,
  };
}
