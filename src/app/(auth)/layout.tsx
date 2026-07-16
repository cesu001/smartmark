import { AdSense } from "@/components/AdSense";

// Public auth pages (login, register, forgot/reset password) — AdSense loads
// here so ads run on public surfaces but never under the dashboard layout.
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AdSense />
      {children}
    </>
  );
}
