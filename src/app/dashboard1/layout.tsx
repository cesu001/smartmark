import AppNavbar from "@/components/dashboard/AppNavbar";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <AppNavbar />
        <div className="px-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
