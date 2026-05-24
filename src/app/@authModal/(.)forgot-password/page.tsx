"use client";
import ForgotForm from "@/components/auth/ForgotForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function ForgotPasswordModal() {
  const router = useRouter();
  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold mb-3">
            Forgot Password
          </DialogTitle>
          <DialogDescription>
            Enter your email address below, and we'll send you a reset-password
            link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Continue with email
              </span>
            </div>
          </div>
          <ForgotForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
