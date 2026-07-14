import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import ResetForm from "@/components/auth/ResetForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Smark account.",
  // Token-bearing URLs must never be indexed.
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { token } = await searchParams;
  let userEmail: string | undefined = undefined;
  let isTokenValid = false;

  if (token) {
    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (storedToken && new Date() < new Date(storedToken.expires)) {
      userEmail = storedToken.email;
      isTokenValid = true;
    }
  }
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-background p-4">
      <div className="w-full max-w-120 bg-card text-card-foreground rounded-lg shadow-sm p-4 pb-8 border border-border">
        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="text-2xl font-bold mb-3">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below to reset your account password.
          </p>
          {isTokenValid && userEmail ? (
            <p className="text-sm text-muted-foreground text-center">
              Resetting password for{" "}
              <span className="font-semibold text-foreground">{userEmail}</span>
            </p>
          ) : (
            <p className="text-sm text-destructive text-center font-medium">
              Invalid or expired reset link. Please request a new one.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Reset with new password
              </span>
            </div>
          </div>
          <ResetForm token={isTokenValid ? token : undefined} />
        </div>
      </div>
    </div>
  );
}
