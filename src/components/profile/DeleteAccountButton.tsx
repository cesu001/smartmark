"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/dashboard/user", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Failed to delete account");
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Account
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="place-items-stretch sm:place-items-stretch text-left">
            <AlertDialogTitle className="text-xl font-bold">
              Delete account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-semibold [text-wrap:unset]">
              This will permanently delete your account and all associated
              notes, collections, and tags. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete Account"}
            </AlertDialogAction>
            <AlertDialogCancel disabled={deleting} className="w-full mt-0">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
