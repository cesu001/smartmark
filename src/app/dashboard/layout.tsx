import type { Metadata } from "next";
import AppNavbar from "@/components/dashboard/AppNavbar";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Smark" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full flex flex-col h-screen overflow-hidden">
        <AppNavbar />
        <div className="flex-1 min-h-0 p-2 overflow-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
