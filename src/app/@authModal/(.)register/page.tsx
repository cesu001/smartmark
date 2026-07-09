"use client";
import RegisterForm from "@/components/auth/RegisterForm";
import SocialSignIn from "@/components/auth/SocialSignIn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function RegisterModal() {
  const router = useRouter();
  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold mb-3">
            Welcome !
          </DialogTitle>
          <DialogDescription>
            Choose your registration method and get started with Smark.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <SocialSignIn />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
          <RegisterForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
