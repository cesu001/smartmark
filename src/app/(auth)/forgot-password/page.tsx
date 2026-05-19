import ForgotForm from "@/components/auth/ForgotForm";

export default function Page() {
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-zinc-50 p-4">
      <div className="w-full max-w-120 bg-white rounded-lg shadow-sm p-4 pb-8 border border-zinc-200">
        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="text-2xl font-bold mb-3">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address below, and we'll send you a reset-password
            link.
          </p>
        </div>
        <div className="flex flex-col gap-4">
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
      </div>
    </div>
  );
}
