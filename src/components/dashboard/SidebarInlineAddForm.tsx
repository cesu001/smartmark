"use client";

import { Plus, Check, X } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInlineCreate } from "@/hooks/useInlineCreate";

interface SidebarInlineAddFormProps {
  /** POST endpoint that creates the entity; receives `{ name }`. */
  endpoint: string;
  placeholder: string;
  successMessage: string;
  errorMessage: string;
}

/**
 * Inline "add" affordance for a sidebar section: a Plus button that expands into
 * a name Input with confirm/cancel controls. Shared by the Collections and Tags
 * sections, which differ only in endpoint, placeholder, and toast copy.
 */
export default function SidebarInlineAddForm({
  endpoint,
  placeholder,
  successMessage,
  errorMessage,
}: SidebarInlineAddFormProps) {
  const { open, setOpen, name, setName, loading, inputRef, handleSubmit, handleCancel } =
    useInlineCreate({ endpoint, successMessage, errorMessage });

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
          placeholder={placeholder}
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
