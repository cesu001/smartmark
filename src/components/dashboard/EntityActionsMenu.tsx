"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type EntityType = "collection" | "tag";

interface EntityActionsMenuProps {
  id: string;
  name: string;
  type: EntityType;
  noteCount: number;
  redirectTo: string;
}

const truncate = (value: string) =>
  value.length > 20 ? value.slice(0, 20) + "…" : value;

const EntityActionsMenu = ({
  id,
  name,
  type,
  noteCount,
  redirectTo,
}: EntityActionsMenuProps) => {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleRename() {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/${type}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      toast.success(`${type === "collection" ? "Collection" : "Tag"} renamed`);
      setEditOpen(false);
      router.refresh();
    } catch {
      toast.error(`Failed to rename ${type}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/${type}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(`${type === "collection" ? "Collection" : "Tag"} deleted`);
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error(`Failed to delete ${type}`);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => {
              setNewName(name);
              setEditOpen(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {type}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="entity-name">Name</Label>
            <Input
              id="entity-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
              disabled={saving}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleRename}
              disabled={saving || !newName.trim()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="place-items-stretch sm:place-items-stretch text-left">
            <AlertDialogTitle className="text-xl font-bold">
              Delete {type}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-semibold [text-wrap:unset]">
              {type === "collection" ? (
                <>
                  &ldquo;{truncate(name)}&rdquo; and{" "}
                  <span className="text-destructive">
                    its {noteCount} note{noteCount === 1 ? "" : "s"} will be
                    permanently deleted
                  </span>
                  . This action cannot be undone.
                </>
              ) : (
                <>
                  &ldquo;{truncate(name)}&rdquo; will be permanently deleted.
                  Notes with this tag will keep their content but lose this
                  tag. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
            <AlertDialogCancel disabled={deleting} className="w-full mt-0">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EntityActionsMenu;
